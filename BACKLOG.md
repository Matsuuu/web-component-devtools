Backlog in priority order:

- Method calls
- Events.. What to do with these?
    - Flash the element when it's dispatched? Would require adding listeners on SELECT action and removing them later
    !! Attach event listeners where you attach mutation observers and remove them in the same fashion

- Custom Element Manifest support
    - Basic support done. Finalize it, and get all the data needed

=> Show inherited elements, with a hover bubble showing where it's inherited from
=> Show Superclass

- Make sure it's stabile.
- Support for other WC libraries. 
    - Haunted
    - Atomico
    - Hybrids
    - Stencil
    - Vue

- Make the injection maybe happen only when devtools are opened? 
- Make nydus it's own package
- Make a hook for opening up web components devtools => Currently asking @aerotwist about this
- Make functions triggerable through buttons in the UI (needs research and maybe even a CEM)
- List event listeners of element, maybe even make it able to trigger them?


StratchPad:

Inheritance icon: 
https://thenounproject.com/term/inheritance/3438437/


- Inspired by CEM:



Known Bugs:

- Component tree children are not currently determined correctly

