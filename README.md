# Web Component DevTools

Web Component DevTools is aimed at all developers working with Web Components. 
The tooling provided creates a new Chrome Devtools panel, which allows a quick look at the custom elements on the current page, and enables modification of attributes and properties of said components.

Web Component DevTools works best when combined with the use of a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest). To enable analysis on your project, use a analyzer like the [Open-WC Custom Elements Analyzer](https://github.com/open-wc/custom-elements-manifest/tree/master/packages/analyzer)

Web Component DevTools also works with libraries built for developing Web Components. Currently the libraries, with extra support by DevTools are:

-   [Lit](https://github.com/lit/lit/)

The list of extra support libraries will grow as adoption grows

Issues:

Any issues you run into while using the DevTools should be submitted to the GitHub Repository (https://github.com/Matsuuu/web-component-devtools/issues).


## Architecture

The current architecture of the project goes as follow:

- html => Pages of the devtools
- lib => All of the extension code, excluding html pages, and packages like Nydus
    - background => All of the background pages of the DevTools. Background page acts as a bridge between background tasks and the content scripts
    - cem => Custom Elements Manifest parsing and tooling
    - content => [Content scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
    - crawler => All of the code injected onto the inspected page to query elements and act upon events
    - elements => All of the custom elements used by the DevTools
    - types => Typings and Enums
    - util => Utility functions
    - view => The actual devtools view and it's init scripts

- context-menus.js => Context menu actions and communication
- devtools.js => Panel and general initialization actions. Lifecycle callbacks


## Local Development

If you want to develop or use the devtools locally, you can do so by following these steps:

1. Clone this repository
2. Run `npm install`
3. run `npm run build`
4. Go to Chrome Extensions
5. Enable Developer mode
6. Choose "Load Unpacked"
7. Select the generated `dist` -directory in the project folder
