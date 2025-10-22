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

