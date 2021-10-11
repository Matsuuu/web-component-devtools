v 0.1.13

- Clean up devtools console output
- Add more information about the use of devtools console
- Allow OSX bindings on devtools console
- Bridge messaging connections more effectively
- Allow "$0" to refer to selected component in devtools console
- Fix re-selecting selected element on refresh

v 0.1.12

- Remove leftover WC DevTools properties from console output
- Improve the performance of Nydus messaging

v 0.1.11

- A new panel: "Source".
    - Used for observing the source code of custom elements
- A new panel: "Console".
    - Used to interact with the inspected element
    - Uses the inspected object as it's context, allowing for easy function calls and property binding
- Add preliminary Angular support
- Updated the UI
- Improved data flow and developer experience
- Implemented Dark Mode
- Optimized packaging
- General bugfixes

v 0.1.10

- Re-implement checking for local Custom Elements manifest files
    - Used data is a combination of a local CEM and the one analyzed by WCDT
- Update cache handling when parsing properties, increasing parsing speed
- Fix recognizing non-editable fields, like element references and functions
- Sort items in the inspector window
- Show properties as is instead of the modified version
- Implement Roboto on all platforms

v 0.1.9

- Implement Custom Elements analyzer inside devtools

v 0.1.8

- Reduce unnecessary querying of DOM
- Reduce unnecessary messaging between layers
- Make the extension more error resistant
- Reduce clutter in the developer's log
- General bug fixes

v 0.1.7

- Fix bug with Windows machine Path parsing
- Fix bug where devtools kept re-selecting element on refresh

v 0.1.6

- Integrate Custom Elements Manifest analyzer to devtools
- Reduce unnecessary messaging on pages with devtools closed
- Move fetch operations to background pages to reduce console clutter
- Improve extension context re-validation
- Custom context menu in devtools
- Scroll to element option in context menu
- Add error handling
- Add error messaging
- General bug fixes

v 0.1.5

- Fix element list hiding / displaying to not show children of hidden elements

v 0.1.4

- Bugfix: Fix element list parsing and ordering when mixing light and shadow DOM and list items
- Enhancement: Moved from DOM events to postMessage on devtools communcation
- Improved stability of messaging
- Removed unnecessary permissions
- Implemented Firefox support

v 0.1.3

- Bugfix: Element list updates on shadow DOM element changes e.g. Item added to list
- Compatibility with Polymer elements
- Compatibility with Vaadin elements
- Add non-editable fields for Nodes and Functions
- Throttle querying to increase performance
- Add error messaging
- Updated the performance of mutation observers and property updates
- Re-name tab to "Web Components"
- Add toggleable HTML tag previews next to custom elements in devtools list

v 0.1.2

- Fix reactivity of property updates in devtools
- Cast number property values to numbers by default
- Improve Lit Type detection
- Autofocus on previously focused element on refresh 
- Casting of function parameters follows the CEM typings
- Support for union types
- Better manifest url parsing

v 0.1.1

- Update Lit Element Support to support Lit 2.0 components
- Improve General Ducktyping
- Fix a MediaQuery check on inspector window resizer
- Compatibility with FAST elements
- Compatibility with Atomico elements
- Add a combination field for attributes when DevTools can't determine the type
- Make attributes toggleable more easily
- Remove unused code
- Improve DX/UX
