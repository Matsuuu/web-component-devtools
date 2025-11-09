- Start Date: 2025-11-09
- RFC PR: 

# Summary

Implement an uniform way of discovering Custom Element Manifests from development-time web projects

# Basic example

There are a few approaches to discovering a CEM. The initial way with zero developer-side intervention would be to just 
scan around the common paths ("/", "/dist", "/assets", "/scripts"), but this approach will not provide us with a reliable
way of discovering the manifest file and will lead to bad developer experience.

A better way to allow discovery would be to provide metadata information about the CEM path in the HTML document of the page.
This could be easily done via a `<meta>` tag in the head of the HTML document.

This was already discussed in the Custom Elements Manifest pull requests some years ago but the need for it was 
not fully explored. https://github.com/webcomponents/custom-elements-manifest/pull/70

## The actual proposal

Authors of projects would append an `<meta>` field into their HTML file's head, which points to the custom elements manifest.
This field can be either appended into the actual HTML file, or resolved via an Vite plugin at build time.

```html
<meta name="custom-elements-manifest" content="/dist/custom-elements.json" />
```

# Motivation

Bundling an CEM parser into the Web Component Devtools is both extremely heavy, as well as error prone.
Analyzing bundled outputs will not provide the developers with the information they actually need to debug their components.

By offloading the generation of CEM's to the developers, we can utilize the locally built manifests and provide factual information.

# Detailed design

In the Web Component Devtools point of view, we will stop generating CEM's and analyzing their information.

Rather than this, we will only rely on manifests that are provided by the development environment itself via 
static files or a provided plugin.

To support adoption, the WCDT docs or even devtools window should provide documentation on how to generate 
the manifest via an Vite plugin or a build script.

I think something that should be considered is if WCDT wants to ship a Vite plugin to help adoption.
The plugin would focus on creating CEM manifests via an existing tool like [@custom-elements-manifest/analyzer](https://custom-elements-manifest.open-wc.org/)
or the [CEM Go package](https://github.com/bennypowers/cem/tree/main) and then appending the HTML meta tag pointing to said 
generated output. This would make the adoption as easy as just adding the plugin to your build flow,
or adding the meta tag entry to your HTML file.


# Drawbacks

The only drawback here is that we are giving up a little bit of that "Just install the extension" -flow,
but at the same time we would be able to provide a lot more of a stable experience to our users.

This kind of helper plugin approach is already adopted by other popular frameworks like [Vue](https://devtools.vuejs.org/guide/vite-plugin).

# Alternatives

There really are no other alternatives that would allow us to provide up-to-date data on the components.

Running a browser extension locks us into a setup where we have no access to the user's filesystem and therefore
are not able to run the analysis on the actual source files in a reliable manner.

# Adoption strategy

I think the best approach would be to provide clear steps to adopting the local dev plugin to your projects
directly inside of the devtools. This would mean that we need an UI fob that informs whether or not we found
the CEM manifest and how the user could provide us with it for a better debug experience.

At least for the starting phases of the v2 deployment, we could still do a little bit of poking around on the same sources that the page is calling 
(e.g. http://localhost:8080/dist/custom-elements.json) and see if we can find the package ourselves. Thought this approach could also
backfire as developers could accidentally get a working setup in one project and not in another, causing confusion.

