// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no lit elements are on the page, no need to instantiate.
// >>>> Need to find out a way to detect if any lit elements are on the page.
chrome.devtools.panels.create("Lit Devtools", null, "/dist/lit-devtools-chrome.html", null);

// TODO(matsuuu): Should we maybe have multiple views/tabs?

console.log("[LDT]: Lit dev tools initialized");


