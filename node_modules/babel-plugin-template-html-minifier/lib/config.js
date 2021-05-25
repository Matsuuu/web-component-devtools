'use strict';
const isBuiltinModule = require('is-builtin-module');
const createMinifyCSS = require('./minify-css');

function ownerName(importSource) {
	const parts = importSource.split('/', importSource[0] === '@' ? 2 : 1);

	return parts.join('/');
}

function getPkgMain(importOwner) {
	const pkgInfo = require(importOwner + '/package.json');
	/* istanbul ignore next */
	return pkgInfo.module || pkgInfo['jsnext:main'] || pkgInfo.main;
}

function bareName(importSource) {
	if (isBuiltinModule(importSource)) {
		/* Don't rule out possibility that a built-in module could provide an html tag
		 * but also avoid any additional processing of the module name. */
		return importSource;
	}

	const importOwner = ownerName(importSource);
	const pkgMain = getPkgMain(importOwner);

	if (pkgMain && importSource === [importOwner, pkgMain].join('/')) {
		return importOwner;
	}

	return importSource;
}

function normalizeExportConfig(settings) {
	if (settings === null || typeof settings === 'string') {
		return {
			type: 'basic',
			name: settings
		};
	}

	return {
		type: 'member' in settings ? 'member' : 'basic',
		...settings
	};
}

function normalizeModuleConfig(name, items) {
	const defaultExport = items.filter(item => item.name === null);
	const namedExports = items.filter(item => item.name !== null);
	const moduleConfig = {namedExports};

	const dupCheck = new Set();
	for (const item of namedExports) {
		if (dupCheck.has(item.name)) {
			throw new Error(`Module ${name} lists export ${item.name} multiple times.`);
		}

		dupCheck.add(item.name);
	}

	moduleConfig.count = items.length;

	if (defaultExport.length > 1) {
		throw new TypeError(`Module ${name} has ${defaultExport.length} default exports`);
	}

	if (defaultExport.length === 1) {
		moduleConfig.defaultExport = defaultExport[0];
	}

	return moduleConfig;
}

function findModuleConfig(modulesConfig, importSource) {
	if (importSource[0] === '.' || importSource[0] === '/') {
		return null;
	}

	if (modulesConfig[importSource]) {
		return modulesConfig[importSource];
	}

	try {
		return modulesConfig[bareName(importSource)] || null;
	} catch (_) {
		return null;
	}
}

function getModuleConfig(modulesConfig, importSource) {
	return findModuleConfig(modulesConfig, importSource) || normalizeModuleConfig(importSource, []);
}

function normalizeModulesConfig(modules) {
	if (!modules) {
		return {};
	}

	const modulesConfig = {};
	for (const [name, module] of Object.entries(modules)) {
		modulesConfig[name] = normalizeModuleConfig(name, module.map(normalizeExportConfig));
	}

	return modulesConfig;
}

function normalizeMinifierConfig(config) {
	if (!config || !config.htmlMinifier) {
		return undefined;
	}

	if (!config.htmlMinifier.minifyCSS || typeof config.htmlMinifier.minifyCSS === 'function') {
		return config.htmlMinifier;
	}

	// Create a custom minifyCSS function is the user didn't provide one
	const minifyCSS = createMinifyCSS(config);

	return {
		...config.htmlMinifier,
		minifyCSS
	};
}

module.exports = {
	normalizeModulesConfig,
	getModuleConfig,
	normalizeMinifierConfig
};
