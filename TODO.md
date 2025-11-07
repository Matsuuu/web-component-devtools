# Web Component Devtools v2 TODO list

Okay so we are in a pickle now in the sense that we cannot get our element tree from Content Script land to
the actual User land, and it's a requirement since we need to know the selected element.

As much as I enjoy having the tree in content scripts, and having it completely out of the actual page, I think we
need to inject the whole Tree parsing layer into the actual userland DOM, since we cannot get the actual element references any other way.

TODO: Check if we can persist data between 2 executeScript calls or if they are sandboxed.

TODO: Create a injected Script that gets put into the userland, which contains the tree stuff and an easy bridge to communicate with it

- [x] Highlight hovered element in DOM.
- [ ] Allow selecting an element in devtools and parsing basic data out of it 
- [ ] Set up CEM evaluation from local or generated manifest
- [ ] Allow updating attributes and properties through devtools
- [ ] Observe events from devtools
- [ ] Recognize between Lit etc. elements
- [ ] Inspect element via Context Menu
- [ ] If acquiring data from browser alone is too tricky, we could make a Vite plugin?  


