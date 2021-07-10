# Web Component DevTools

Web Component DevTools is aimed at all developers working with Web Components. 
The tooling provided creates a new Chrome Devtools panel, which allows a quick look at the custom elements on the current page, and enables modification of attributes and properties of said components.

Web Component DevTools works best when combined with the use of a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest). To enable analysis on your project, use a analyzer like the [Open-WC Custom Elements Analyzer](https://github.com/open-wc/custom-elements-manifest/tree/master/packages/analyzer)

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
- *Inspecting and modifying the properties of custom elements
- *Observing dispatched events
- *Calling functions of the custom element


-* Feature is limited to [supported libraries ](#supported-libraries) and projects with a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest).

**_For the best development experience it is recommended to integrate a Custom Elements analyzer to the project, so
that the elements get analyzed on build-time, generating a up-to-date manifest for the devtools to use._**


An example development setup of a [Modern Web Dev Server](https://modern-web.dev/docs/dev-server/overview/) paired with a CEM analyzer would look like this:

  ```json
  {
   "scripts": {
      "start": "concurrently \"wds\" \"cem analyze --watch\""
   },
   "devDependencies": {
      "@custom-elements-manifest/analyzer": "^0.4.11",
      "@web/dev-server": "^0.1.18",
      "concurrently": "^6.2.0"
    }
  }
  ```


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

When developing with these libraries, the feature set of the devtools is increased, without the addition of the Custom Elements Manifest.

Extra features provided for these libraries include for example inspecting and editing of the properties of custom elements.

The list of extra support libraries will grow as adoption grows

## Issues:

Any issues you run into while using the DevTools should be submitted to the GitHub Repository (https://github.com/Matsuuu/web-component-devtools/issues).


## Discussion

Join the discussion in Lit and Friends slack in the channel #web-component-devtools

Join here: https://join.slack.com/share/zt-sffg0x76-2t1QoM1JWXrzfEbL9XP2_w

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
