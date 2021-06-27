Backlog in priority order:

- Make Fail of custom-elements.json fetch not cause console error
- Remove elements from SELECT_RESULT which break the message
    - What to do with these? Maybe just ignore for now?
- Finish all inputs in inspector (Textarea for example)
=> Make Objects and Arrays create summaries

e.g: Items: [1,2,3] 

Items : [_1,_2,_3] EDITABLE

Items: [{id: 22, name: "Matsu"}, { id: 12, "Mutsu"}]

ARROW_DOWN Items:
               ARROW_DOWN 0:
                            id: [_22_]
                            name: [_Matsu_]
               ARROW_DOWN 1:
                            id: [_12_]
                            name: [_Mutsu]


ARROW_DOWN User: { id: 22, name: "Matsu", roles: [{ id: 0, roleName: "Boss" }]}
                id: [_22_]
                name: [_Matsu_]
     ARROW_DOWN roles:
                    id: 0,
                    roleName: "Boss"
            

- Method calls
- Events.. What to do with these?
    - Enable triggering these events? Could native events bring problems?
    - Flash the element when it's dispatched? Would require adding listeners on SELECT action and removing them later

- Custom Element Manifest support
    - Basic support done. Finalize it, and get all the data needed
    - What to do with methods and events? Create issues to discuss?
=> Show inherited elements, with a hover bubble showing where it's inherited from
=> Show Superclass

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



Known Bugs:

- Component tree children are not currently determined correctly

