import { querySelectorAllDeep } from "query-selector-shadow-dom";

export function findCustomElements() {
    let elements = Array.from(querySelectorAllDeep("*"))
        .filter(elem => customElements.get(elem.nodeName.toLowerCase()))

    return elements;
}

