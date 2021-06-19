
TODO next:

- Nydus tab specificity
    - Figure out how to get the current tab info to content script and panel
    - Maybe a one time message PING to get it from background?
    - Assign it then to nydus?

- Make a hook for opening up web components devtools => I don't think this is possible
- Make nydus it's own package

Backlog:

- Custom Element Manifest support
- Support for other WC libraries. 
    - Haunted
    - Atomico
    - Hybrids
    - Stencil
    - Vue

- Function call callbacks
- Event listeners ?

- Integrate Stoxy to make devtools remember stuff? Would this cause problems? What should we remember?


Known Bugs:

- If two instances of the devtools are open on different tabs, the inspection might break
