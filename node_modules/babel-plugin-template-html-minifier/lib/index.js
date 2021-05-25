'use strict';
const htmlMinifier = require('html-minifier-terser');

const cookRawQuasi = require('./cook-raw-quasi');
const {normalizeModulesConfig, normalizeMinifierConfig, getModuleConfig} = require('./config.js');

function setupDefaultBindingOption(bindings, binding, moduleConfig) {
	if (!moduleConfig.defaultExport) {
		return false;
	}

	bindings.push({
		binding,
		options: moduleConfig.defaultExport,
		star: false
	});

	return true;
}

function setupNamedBindingOption(bindings, binding, moduleConfig, name) {
	const namedExports = moduleConfig.namedExports.filter(item => item.name === name);
	if (namedExports.length === 1) {
		bindings.push({
			binding,
			options: namedExports[0],
			star: false
		});
	}
}

function setupStarBindingOption(bindings, binding, moduleConfig) {
	bindings.push({
		binding,
		options: moduleConfig.namedExports,
		star: true
	});
}

function uniqueId(value) {
	let id;
	do {
		id = Math.random().toString(36).replace(/^0\.\d*/, '');
	} while (value.includes(id));

	return 'babel-plugin-template-html-minifier:' + id;
}

function encapsulationGetTags({encapsulation}) {
	if (encapsulation) {
		return {
			opening: `<${encapsulation}>`,
			closing: `</${encapsulation}>`
		};
	}

	return {
		opening: '',
		closing: ''
	};
}

function minify(path, state, bindingOptions) {
	const template = path.get('quasi');
	const t = state.babel.types;
	const quasis = template.node.quasis.map(quasi => quasi.value.raw);
	const placeholder = uniqueId(quasis.join(''));
	const tags = encapsulationGetTags(bindingOptions);
	let parts;

	try {
		const minified = htmlMinifier.minify(tags.opening + quasis.join(placeholder) + tags.closing, state.minifierConfig);
		if (!minified.startsWith(tags.opening) || !minified.endsWith(tags.closing)) {
			throw new Error(majorDeleteError);
		}

		const minifiedParts = minified.slice(tags.opening.length, -tags.closing.length || undefined).split(placeholder);
		if (minifiedParts.length !== quasis.length) {
			throw new Error(majorDeleteError);
		}

		parts = minifiedParts;
	} catch (error) {
		if (state.failOnError) {
			throw path.buildCodeFrameError(error.message);
		} else if (state.logOnError) {
			console.error(error.message);
		}
	}

	if (parts) {
		parts.forEach((raw, i) => {
			const args = cookRawQuasi(state.babel, raw);
			template.get('quasis')[i].replaceWith(t.templateElement(args, i === parts.length - 1));
		});
	}
}

function handleStar(path, state, objectName, optionsFilter) {
	const binding = path.scope.getBinding(objectName);
	const bindings = state.bindings.filter(item => item.binding === binding && item.star === true && item.options.some(optionsFilter));
	if (bindings.length === 1) {
		minify(path, state, bindings[0].options.filter(optionsFilter));
	}
}

function handleSimple(path, state, binding, itemCheck) {
	if (typeof binding === 'string') {
		binding = path.scope.getBinding(binding);
	}

	const bindings = state.bindings.filter(item => item.binding === binding && item.star === false && itemCheck(item));
	if (bindings.length === 1) {
		minify(path, state, bindings[0].options);
	}
}

function handleMember(path, state) {
	const tag = path.get('tag');
	const propName = tag.node.property.name;

	if (tag.get('object').isThisExpression()) {
		const cls = path.findParent(path => path.isClassDeclaration());
		if (!cls || !cls.node.superClass) {
			return;
		}

		const {superClass} = cls.node;
		if (cls.get('superClass').isIdentifier()) {
			handleSimple(path, state, cls.scope.getBinding(superClass.name),
				item => item.options.member === propName
			);
		} else if (superClass.object && superClass.object.name) {
			handleStar(path, state, superClass.object.name,
				opt => opt.member === propName && superClass.property.name === opt.name && opt.type === 'member'
			);
		}
	} else {
		handleStar(path, state, tag.node.object.name,
			opt => opt.name === propName && opt.type === 'basic'
		);
	}
}

const majorDeleteError = 'html-minifier-terser deleted something major, cannot proceed.';
module.exports = babel => {
	return {
		visitor: {
			Program: {
				enter() {
					this.moduleConfigs = normalizeModulesConfig(this.opts.modules);
					this.minifierConfig = normalizeMinifierConfig(this.opts);
					this.failOnError = this.opts.failOnError !== false;
					this.logOnError = this.opts.logOnError !== false;
					this.babel = babel;
					this.bindings = [];
				}
			},
			CallExpression(path) {
				if (!path.parentPath.isVariableDeclarator() || !path.get('callee').isIdentifier({name: 'require'})) {
					return;
				}

				const moduleName = path.get('arguments.0');
				if (!moduleName.isStringLiteral()) {
					return;
				}

				const moduleConfig = getModuleConfig(this.moduleConfigs, moduleName.node.value);
				if (moduleConfig.count === 0) {
					return;
				}

				const idPath = path.parentPath.get('id');
				if (idPath.isIdentifier()) {
					const binding = path.parentPath.scope.getBinding(idPath.node.name);

					if (!setupDefaultBindingOption(this.bindings, binding, moduleConfig)) {
						setupStarBindingOption(this.bindings, binding, moduleConfig, idPath.node.name);
					}
				} else if (idPath.isObjectPattern()) {
					for (const prop of idPath.node.properties) {
						const binding = path.scope.getBinding(prop.value.name);
						setupNamedBindingOption(this.bindings, binding, moduleConfig, prop.key.name);
					}
				}
			},
			ImportDeclaration(path) {
				const moduleConfig = getModuleConfig(this.moduleConfigs, path.node.source.value);
				if (moduleConfig.count === 0) {
					return;
				}

				for (const spec of path.get('specifiers')) {
					const binding = path.scope.getBinding(spec.node.local.name);
					if (spec.isImportNamespaceSpecifier()) {
						setupStarBindingOption(this.bindings, binding, moduleConfig, spec.node.local.name);
					} else if (spec.isImportDefaultSpecifier()) {
						setupDefaultBindingOption(this.bindings, binding, moduleConfig);
					} else {
						setupNamedBindingOption(this.bindings, binding, moduleConfig, spec.node.imported.name);
					}
				}
			},
			TaggedTemplateExpression(path) {
				const tag = path.get('tag');

				if (tag.isMemberExpression()) {
					handleMember(path, this);
				} else if (tag.isIdentifier()) {
					handleSimple(path, this, tag.node.name, item => item.options.type === 'basic');
				} else if (tag.isCallExpression()) {
					handleSimple(path, this, tag.node.callee.name, item => item.options.type === 'factory');
				}
			}
		}
	};
};

module.exports.majorDeleteError = majorDeleteError;
