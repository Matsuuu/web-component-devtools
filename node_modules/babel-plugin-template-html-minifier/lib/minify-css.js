'use strict';

const CleanCSS = require('clean-css');
const {wrapCSS, unwrapCSS} = require('./wrap-css');

function createMinifyCSS(config) {
	const cssConfig = typeof config.htmlMinifier.minifyCSS === 'object' ? config.htmlMinifier.minifyCSS : undefined;
	const cleanCSS = new CleanCSS(cssConfig);

	return function (css, type) {
		const wrappedCSS = wrapCSS(css, type);
		const result = cleanCSS.minify(wrappedCSS);
		const error = result.errors.length > 0 || (config.strictCSS && result.warnings.length > 0);

		if (error) {
			if (config.failOnError !== false || config.logOnError !== false || config.strictCSS) {
				throw new Error(`[babel-plugin-template-html-minifier] Could not minify CSS: ${result.errors.join(', ')}${result.warnings.join(', ')}`);
			}
		}

		return unwrapCSS(result.styles, type);
	};
}

module.exports = createMinifyCSS;
