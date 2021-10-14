# Web Component DevTools

Web Component DevTools is aimed at all developers working with Web Components. 
The tooling provided creates a new Chrome Devtools panel, which allows a quick look at the custom elements on the current page, and enables modification of attributes and properties of said components.

## Why?

In the process of developing Web Components, wether it be with a library like [Lit](https://github.com/lit/lit/), or without any kind of library,
there comes situtations in which you might want to have a bit more control over your components than what the regular browser devtools gives you.

You might for example want to:

- Toggle the Attributes of the element
- Toggle the Properties of the element
- Monitor when events get dispatched from the element
- Call functions

And when you're working with Web Components, Shadow DOM usually is present, making it fairly difficult to find the path to the element. And even if 
you got the path, having to write `document.querySelector("my-selector-string > element-name").setAttribute("my-attr", "foo")` every time you want to
modify a value is quite cumbersome.

For this use case the Web Components DevTools were created: To enable the developer to easily modify the attributes, properties and therefore state
of their element straight from the devtools window with the click of a button.

## Features

Web Component DevTools provides advanced features to the developer, straight from the browser's UI to, for example:

- Listing custom elements on the page, and accessible iframes inside the page
- Filtering custom elements on the list
- Inspecting and modifying the attributes of custom elements
- Inspecting and modifying the properties of custom elements
- Observing dispatched events
- Calling functions of the custom element
- View the source code of web components on page
- Interact directly with web components through the console

## Download

You can get the Web Component DevTools from the [Chrome Web Store](https://chrome.google.com/webstore/detail/web-component-devtools/gdniinfdlmmmjpnhgnkmfpffipenjljo/related) 

### Setting up

A brief video of setting up your development environment to get the most out of DevTools: https://youtu.be/D6W5iX3-E9E

---

### Supported libraries

Web Component DevTools also works with libraries built for developing Web Components. Currently the libraries, with extra support by DevTools are:

-   [Lit](https://github.com/lit/lit/)
-   [FAST](https://www.fast.design/)
-   [Atomico](https://atomicojs.github.io/)
-   [Polymer](https://polymer-library.polymer-project.org/)
-   [Vaadin](https://vaadin.com/)

When developing with these libraries, the feature set of the devtools is increased, without the addition of the Custom Elements Manifest.

Extra features provided for these libraries include for example inspecting and editing of the properties of custom elements.

The list of extra support libraries will grow as adoption grows

## Issues:

Any issues you run into while using the DevTools should be submitted to the GitHub Repository (https://github.com/Matsuuu/web-component-devtools/issues).


## Discussion

Join the discussion in Lit and Friends slack in the channel #web-component-devtools

Join here: https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw

## Architecture

The current architecture of the project goes as follow:

- html => Pages of the devtools
- lib => All of the extension code, excluding html pages, and packages
    - background => All of the background pages of the DevTools. Background page acts as a bridge between background tasks and the content scripts
    - content => [Content scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
    - crawler => All of the code injected onto the inspected page to query elements and act upon events
    - elements => All of the custom elements used by the DevTools
    - types => Typings and Enums
    - util => Utility functions

- context-menus.js => Context menu actions and communication
- devtools.js => Panel and general initialization actions. Lifecycle callbacks

- Packages => Separate tools used for WCDT, maybe later on built into their own tools
    - Nydus => Message passing and management between layers
    - Analyzer => [Custom Elements Manifest analyzer](https://github.com/open-wc/custom-elements-manifest/tree/master/packages/analyzer) integration
    - Playground => [Playground Elements](https://github.com/google/playground-elements) integration with source view and console view 


## Local Development

Required tools:

- NPM (any up to date version should do)
- A preferably up to date version of Chrome/Edge/Firefox
- A zipping tool (when working with firefox).
- Any OS (windows/mac/linux)

---

If you want to develop or use the devtools locally, you can do so by following these steps:

1. Clone this repository
2. Run `npm install`
3. run `npm run build`
4. Go to Chrome Extensions
5. Enable Developer mode
6. Choose "Load Unpacked"
7. Select the generated `dist` -directory in the project folder

### Firefox

For firefox, you might need to create a zip of the `dist`-folder to ad it to firefox as an extension.

Feel free to use whatever zip tool you want to zip the `dist`-folder.

## Generating a full package

There is a combination script called `npm run package` which builds the project, and packages it utilizing the `zip` command line tool for linux.
