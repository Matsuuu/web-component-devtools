Developer tooling for Web Components and Web Component Libraries
Web Component DevTools is aimed at all developers working with Web Components. The tooling provided creates a new Chrome Devtools panel, which allows a quick look at the custom elements on the current page, and enables modification of  attributes and properties of said components.

Web Component DevTools works best when combined with the use of a Custom Elements Manifest (https://github.com/webcomponents/custom-elements-manifest). To enable analysis on your project, use a analyzer like the Open-WC Custom Elements Analyzer (https://github.com/open-wc/custom-elements-manifest/tree/master/packages/analyzer)


Features:

Web Component DevTools provides advanced features to the developer, straight from the browser's UI to, for example:

- Listing custom elements on the page, and accessible iframes inside the page
- Filtering custom elements on the list
- Inspecting and modifying the attributes of custom elements
- *Inspecting and modifying the properties of custom elements
- *Observing dispatched events
- *Calling functions of the custom element


* Feature is limited to supported libraries and projects with a Custom Elements Manifest.

For the best development experience it is recommended to integrate a Custom Elements analyzer to the project, so that the elements get analyzer on build-time, generating a up-to-date manifest for the devtools to use.



An example development setup of a Modern Web Dev Server (https://modern-web.dev/docs/dev-server/overview/) paired with a CEM analyzer would look like this:

  ```json
// package.json
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



Supported libraries:

Web Component DevTools also works with libraries built for developing Web Components. Currently the libraries, with extra support by DevTools are:

- Lit
- FAST
- Atomico
- Polymer
- Vaadin

When developing with these libraries, the feature set of the devtools is increased, without the addition of the Custom Elements Manifest.

Extra features provided for these libraries include for example inspecting and editing of the properties of custom elements.

The list of extra support libraries will grow as adoption grows


Why?

In the process of developing Web Components, wether it be with a library like Lit, or without any kind of library, there comes situtations in which you might want to have a bit more control over your components than what the regular browser devtools gives you.

You might for example want to:

Toggle the Attributes of the element
Toggle the Properties of the element
Monitor when events get dispatched from the element
Call functions
And when you're working with Web Components, Shadow DOM usually is present, making it fairly difficult to find the path to the element. And even if you got the path, having to write document.querySelector("my-selector-string > element-name").setAttribute("my-attr", "foo") every time you want to modify a value is quite cumbersome.

For this use case the Web Components DevTools were created: To enable the developer to easily modify the attributes, properties and therefore state of their element straight from the devtools window with the click of a button.




Issues:

Any issues you run into while using the DevTools should be submitted to the GitHub Repository (https://github.com/Matsuuu/web-component-devtools/issues).

