'use strict';

const path = require('path');
const template = require('@babel/template').default;
const inherits = require('@babel/plugin-syntax-import-meta').default;

const importStyles = {
	amd: 'new URL(module.uri).href',
	cjs: 'new URL(__filename, document.baseURI).href',
	esm: 'import.meta.url',
	iife: 'document.currentScript && document.currentScript.src || document.baseURI',
	umd: 'document.currentScript && document.currentScript.src || document.baseURI',
	system: 'module.meta.url',
	baseURI: 'document.baseURI'
};

module.exports = () => ({
	inherits,
	visitor: {
		Program(progPath, {opts, file}) {
			const metas = [];
			const identifiers = new Set();
			const {sourceFileName} = file.opts.parserOpts;

			progPath.traverse({
				MetaProperty(path) {
					const {node, scope} = path;

					/* istanbul ignore else */
					if (node.meta && node.meta.name === 'import' && node.property.name === 'meta') {
						metas.push(path);
					}

					for (const name of Object.keys(scope.getAllBindings())) {
						identifiers.add(name);
					}
				}
			});

			if (metas.length === 0) {
				return;
			}

			let metaId = 'importMeta';
			while (identifiers.has(metaId)) {
				metaId = progPath.scope.generateUidIdentifier('importMeta').name;
			}

			/* Check longest basePaths first. */
			const mappings = Object.entries(opts.mappings || {}).reduce((acc, [filePath, baseURL]) => {
				acc[path.resolve(filePath)] = baseURL;

				return acc;
			}, {});
			const basePaths = Object.keys(mappings).sort((a, b) => b.length - a.length);
			let relativeURL;
			for (const basePath of basePaths) {
				if (sourceFileName.startsWith(basePath)) {
					relativeURL = sourceFileName.replace(basePath, mappings[basePath]);
					break;
				}
			}

			if (typeof relativeURL === 'undefined') {
				const bundleDir = opts.bundleDir ? path.resolve(opts.bundleDir) : process.cwd();

				if (!sourceFileName.startsWith(bundleDir)) {
					throw new Error('Does not match any mappings or bundleDir.');
				}

				relativeURL = sourceFileName.replace(bundleDir, '.');
			}

			/* istanbul ignore next */
			if (path.sep === path.win32.sep) {
				relativeURL = relativeURL.split(path.sep).join(path.posix.sep);
			}

			progPath.node.body.unshift(template.ast(`const ${metaId} = {
				url: new URL('${relativeURL}', ${importStyles[opts.importStyle] || importStyles.esm}).href
			};`, {plugins: ['importMeta']}));

			for (const meta of metas) {
				meta.replaceWith(template.ast`${metaId}`);
			}
		}
	}
});
