Backlog in priority order:

- Separate property and attribute update events and handle appropriately
    - Make the CEM check for the element before parsing.
    -> There might be properties etc. we are not getting values of 
- Finish all inputs in inspector (Textarea for example)
    - Code editor blocks for json objects?

- Method calls
- Events.. What to do with these?
    - Enable triggering these events? Could native events bring problems?
    - Flash the element when it's dispatched? Would require adding listeners on SELECT action and removing them later

- Custom Element Manifest support
    - Basic support done. Finalize it, and get all the data needed
    - What to do with methods and events? Create issues to discuss?
- Make sure it's stabile.
- Support for other WC libraries. 
    - Haunted
    - Atomico
    - Hybrids
    - Stencil
    - Vue

- Make nydus it's own package
- Make a hook for opening up web components devtools => Currently asking @aerotwist about this
- Make functions triggerable through buttons in the UI (needs research and maybe even a CEM)
- List event listeners of element, maybe even make it able to trigger them?


StratchPad:

Inheritance icon: 
https://thenounproject.com/term/inheritance/3438437/


- Inspired by CEM:

=> Show inherited elements, with a hover bubble showing where it's inherited from
=> Show Superclass


Known Bugs:

- Component tree children are not currently determined correctly

