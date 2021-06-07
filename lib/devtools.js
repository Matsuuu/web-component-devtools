// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no lit elements are on the page, no need to instantiate.

// >>>> Need to find out a way to detect if any lit elements are on the page.
//
chrome.devtools.panels.create("Web Component Devtools", null, "/dist/wc-devtools-chrome.html", panel => {
});


// TODO(matsuuu): Should we maybe have multiple views/tabs?



