// TODO(matsuuu): Add a conditional to instantiating dev tools.
// If no lit elements are on the page, no need to instantiate.

// >>>> Need to find out a way to detect if any lit elements are on the page.
chrome.devtools.panels.create("Lit Devtools", null, "/dist/lit-devtools-chrome.html", panel => {
    panel.onShown.addListener(window => {
        window.console.log("FOO");
    });
});
console.log("[LDT]: Lit dev tools initialized");

// TODO(matsuuu): Should we maybe have multiple views/tabs?



