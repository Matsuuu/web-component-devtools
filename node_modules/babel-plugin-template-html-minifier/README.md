# babel-plugin-template-html-minifier

[![Travis CI][travis-image]][travis-url]
[![Greenkeeper badge][gk-image]](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

Minify HTML in tagged template strings using [html-minifier-terser](https://github.com/DanielRuf/html-minifier-terser).

## Install

```bash
npm install --save-dev babel-plugin-template-html-minifier
```

## Usage

In `.babelrc`:

```json
{
  "plugins": [
    ["template-html-minifier", {
      "modules": {
        "choo/html": [null],
        "hyperhtml": [{"name": "bind", "type": "factory"}],
        "hyperhtml-element": [{"name": null, "member": "html"}]
      },
      "htmlMinifier": {
        "collapseWhitespace": true
      }
    }]
  ]
}
```

Example for `lit-html` and `lit-element`:

```json
{
  "plugins": [
    ["template-html-minifier", {
      "modules": {
        "lit-html": ["html"],
        "lit-element": [
          "html",
          {"name": "css", "encapsulation": "style"}
        ],
      },
      "strictCSS": true,
      "htmlMinifier": {
        "collapseWhitespace": true,
        "conservativeCollapse": true,
        "removeComments": true,
        "caseSensitive": true,
        "minifyCSS": true
      },
    }]
  ]
}
```

## Options

### `htmlMinifier`

The value of this property is passed unmodified to html-minifier-terser. See the
[html-minifier-terser docs](https://github.com/DanielRuf/html-minifier-terser#options-quick-reference).

Note for usage with `lit-html` and `lit-element`:

- To preserve case sensitiveness of property binding `"caseSensitive": true` must be added.

- `collapseBooleanAttributes` should not be used when working with `lit-html`
or other templating systems which give special meaning to non-static boolean
attributes. Enabling `collapseBooleanAttributes` will cause this plugin to
throw an exception:

  ```js
  html`<input readonly="${readonly}">`;
  ```

  This exception is for two reasons.  First because it means the chosen options have
caused `html-minifier-terser` to change the meaning of the HTML template.  Second because
it deletes the point where `${readonly}` goes into the final output.

- `removeComments` will cause the following template to throw an exception:

  ```js
  html`<!-- <input value="${value}"> -->`;
  ```

  This exception is because `${value}` inside an HTML template gets deleted.  It
should be noted that an HTML template does not prevent code within `${}` from
running.  This means that in the following template `getValue()` is still executed
when processing the `html` template:

  ```js
  html`<!-- <input value="${getValue()}"> -->`;
  ```

  It is recommended to use [binding-positions] from [eslint-plugin-lit] to catch this
error.  This babel transformation can only determine that a template is broken, the
eslint plugin will tell you which binding is invalid.

### `strictCSS`

Whether CSS should only be minified when it is valid CSS. This is necessary when using css templates which allow multiple strings of invalid CSS together to make a valid stylesheet. This is the case for example with `lit-element`:

```js
const unit = css`px`;
const widthXL = 400;
const styleSheet = css`
  @media (${widthXL}px) {
    .foo {
      font-size: 16${unit};
    }
  }
`;
```

Minification happens per template literal, it is only able to see the unconcatenated css literals and minify those. It will try to do the right thing, but it cannot handle every scenario. If you are using `lit-element`, and write these types of templates, you need to set `strictCSS` to true.

### `modules`

A list of module names or import paths where tags are imported from.  The values in
the arrays refers to the export names, not the import names.  `null` refers to the
default export.

### `failOnError`

Determines whether an error should be thrown when minification failed. defaults to true.

Minification can fail when using invalid syntax or comments within bindings. Especially
when using css with bindings minification can fail. When `failOnError` is true, this
plugin throws an error and your build will stop from proceeding. When it is false
the minification is canceled and the template is left unminified.

### `logOnError`
Determines whether failure to minify a template should be logged in case of an error.
Defaults to true. This setting only takes effect when `failOnError` is false.

```js
import choo from 'choo/html';
import * as lit from 'lit-html';
import {html as litHtml, css} from 'lit-element';
import HyperHTMLElement from 'hyperhtml-element';
import html from 'some-module';
import {bind} from 'hyperhtml';

choo`
  <div class="hello">
    Hello World
  </div>
`;

lit.html`
  <div class="hello">
    Hello World
  </div>
`;

litHtml`
  <div class="hello">
    Hello World
  </div>
`;

css`
  .sel {
    background: red;
  }
`;

class MyHyperHTMLElement extends HyperHTMLElement {
  created() {
    this.render();
  }

  render() {
    this.html`
      <div>
        Hello World
      </div>
    `;
  }
}

bind(document.body)`
  <div>
    Hello World
  </div>
`;

html`
  This
  is
  not
  processed
`;
```

Using the .babelrc shown in [usage](#Usage) produces the following output:

```js
import choo from 'choo/html';
import * as lit from 'lit-html';
import {html as litHtml, css} from 'lit-element';
import HyperHTMLElement from 'hyperhtml-element';
import html from 'some-module';
import {bind} from 'hyperhtml';

choo`<div class="hello"> Hello World </div>`;

lit.html`<div class="hello"> Hello World </div>`;

litHtml`<div class="hello"> Hello World </div>`;

css`.sel{background:red}`;

class MyHyperHTMLElement extends HyperHTMLElement {
  created() {
    this.render();
  }

  render() {
    this.html`<div> Hello World </div>`;
  }
}

bind(document.body)`<div> Hello World </div>`;

html`
  This
  is
  not
  processed
`;
```

* choo is processed because of `"choo/html": [null]` specifies that the default
export should be processed.
* lit.html is processed because `"lit-html": ["html"]`.
* litHtml is processed because `"lit-element": ["html"]`.
* css is processed because `"lit-element": [{"name": "css", "encapsulation": "style"}]`.
  The `encapsulation` argument ensures that `html-minifier-terser` understands that the template
  contains CSS, without it the template would be processed as HTML.
* `this.html` in MyHyperHTMLElement is processed because
`"hyperhtml-element": [{"name": null, "member": "html"}]` specifies that the `html` member
of classes which extend the default export should be processed.
* bind is processed because of `"hyperhtml": [{"name": "bind", "type": "factory"}]`, the
  type `factory` specifies the bind returns a function which processes the tagged templates.
* html is not processed because it was exported from an unlisted module.

All matching is done based on the exported name, not the local/imported name.

## Running tests

Tests are provided by xo and ava.

```sh
npm install
npm test
```

## Attribution

This module was originally created by [goto-bus-stop](https://github.com/goto-bus-stop).

## `babel-plugin-template-html-minifier` for enterprise

Available as part of the Tidelift Subscription.

The maintainers of `babel-plugin-template-html-minifier` and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-babel-plugin-template-html-minifier?utm_source=npm-babel-plugin-template-html-minifier&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)


[npm-image]: https://img.shields.io/npm/v/babel-plugin-template-html-minifier.svg
[npm-url]: https://npmjs.org/package/babel-plugin-template-html-minifier
[travis-image]: https://travis-ci.org/cfware/babel-plugin-template-html-minifier.svg?branch=master
[travis-url]: https://travis-ci.org/cfware/babel-plugin-template-html-minifier
[gk-image]: https://badges.greenkeeper.io/cfware/babel-plugin-template-html-minifier.svg
[downloads-image]: https://img.shields.io/npm/dm/babel-plugin-template-html-minifier.svg
[downloads-url]: https://npmjs.org/package/babel-plugin-template-html-minifier
[license-image]: https://img.shields.io/npm/l/babel-plugin-template-html-minifier.svg

[binding-positions]: https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/binding-positions.md
[eslint-plugin-lit]: https://github.com/43081j/eslint-plugin-lit#readme
