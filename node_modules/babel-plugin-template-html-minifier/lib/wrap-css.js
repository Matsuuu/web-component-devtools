'use strict';

/**
 * These functions are taken from https://github.com/kangax/html-minifier
 *
 * Original MIT license:
 * Copyright (c) 2010-2018 Juriy "kangax" Zaytsev
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * There is a request for exposing them for public use: https://github.com/kangax/html-minifier/issues/1038
 */

function wrapCSS(text, type) {
	switch (type) {
		case 'inline':
			return `*{${text}}`;
		case 'media':
			return `@media ${text}{a{top:0}}`;
		default:
			return text;
	}
}

function unwrapCSS(text, type) {
	let matches;
	switch (type) {
		case 'inline':
			matches = text.match(/^\*{(?<text>[\s\S]*)}$/);
			break;
		case 'media':
			matches = text.match(/^@media (?<text>[\s\S]*?)\s*{[\s\S]*}$/);
			break;
		default:
			break;
	}

	return matches ? matches.groups.text : text;
}

module.exports = {
	wrapCSS,
	unwrapCSS
};
