# Web Component DevTools

Under development


### Plan

The plan with Web Component DevTools is to allows Web component developers to have a storybook-like experience when developing their components.
This would mean that the developer could easily through devtools change the properties and attributes of the component, and maybe even trigger events emitted by the component.

The Devtools is currently developed to crawl through the page, determine all the custom elements, and then tries to Ducktype the elements by their properties. 
The end game plan is to have support for different WC libraries, and their ways of handling properties and such.

Later on when [custom element manifest](https://github.com/webcomponents/custom-elements-manifest) becomes a wide-spread thing, I hope to add support for that too.
