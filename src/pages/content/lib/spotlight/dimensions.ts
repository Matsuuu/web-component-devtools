import { TreeElement } from "../element";

export function getSpotlightElementDimensions(element: TreeElement) {
    const el = element.element;

    return el.getBoundingClientRect();
}
