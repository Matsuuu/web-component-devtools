# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.2](https://github.com/cfware/babel-plugin-bundled-import-meta/compare/v0.3.1...v0.3.2) (2019-12-31)


### Bug Fixes

* Remove filename from exception, update dependencies ([f148405](https://github.com/cfware/babel-plugin-bundled-import-meta/commit/f148405797161394b8f5bd3e7b9040c4d62c6d3d))

### [0.3.1](https://github.com/cfware/babel-plugin-bundled-import-meta/compare/v0.3.0...v0.3.1) (2019-06-07)



# [0.3.0](https://github.com/cfware/babel-plugin-bundled-import-meta/compare/v0.2.2...v0.3.0) (2019-03-02)


### Features

* Add baseURI importStyle. ([#4](https://github.com/cfware/babel-plugin-bundled-import-meta/issues/4)) ([bad102c](https://github.com/cfware/babel-plugin-bundled-import-meta/commit/bad102c)), closes [#3](https://github.com/cfware/babel-plugin-bundled-import-meta/issues/3)


### BREAKING CHANGES

* Drop support for generating node.js compatible
importStyle polyfill.  node.js targets can still be supported by letting
rollup output format handle the polyfill.
