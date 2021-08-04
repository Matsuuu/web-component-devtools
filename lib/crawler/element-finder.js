import { ELEMENT_DEPTH, FOUND_ELEMENTS } from './crawler-constants.js';
import { elementIsDefined } from './crawler-utils.js';
import { parseElements } from './element-parser.js';

/**
 * @typedef FoundComponentExt
 * @property { Array } __WC_DEV_TOOLS_CHILD_COMPONENTS
 *
 * @typedef { HTMLElement & FoundComponentExt } FoundComponent
 *
 * */

let iframeAccessWasBlocked = false;
let iframeAccessHasBeenLogged = false;

export function findCustomElements() {
    const elements = findAllElements(document.body);
    if (iframeAccessWasBlocked && !iframeAccessHasBeenLogged) {
        console.warn("[WebComponentDevTools]: Couldn't access some of the iframes on page");
        iframeAccessHasBeenLogged = true;
    }
    return elements;
}


/**
 * @param {HTMLElement | ShadowRoot} elem
 *
 * @returns {Array<HTMLElement>} elements
 */
export function findAllElements(elem) {
    let elements = /** @type { Array<HTMLElement> } */ (Array.from(elem.querySelectorAll('*')));

    let allElements = [];
    for (const e of elements) {
        allElements.push(e);
        if (e.shadowRoot) {
            allElements = [...allElements, ...findAllElements(e.shadowRoot)];
        }
        if (e.nodeName === 'IFRAME') {
            // @ts-ignore
            try {
                allElements = [...allElements, ...findAllElements(e.contentWindow.document)];
            } catch (err) {
                // Couldn't access iframe
                iframeAccessWasBlocked = true;
            }
        }
    }

    return allElements.filter(
        elem =>
            elem.nodeName.includes('-') &&
            elementIsDefined(elem) &&
            elem.nodeName.toLowerCase() !== 'wc-devtools-spotlight-border',
    );
}

export function findElementsOnPage() {
    let customElements = findCustomElements();
    calculateElementDepths(customElements);

    const parsedElements = parseElements(customElements);
    window[FOUND_ELEMENTS] = parsedElements.elementsRefArray;

    return parsedElements;
}

export function getCachedFoundElements() {
    return window[FOUND_ELEMENTS];
}

/**
 * @param {Array<HTMLElement>} elements
 */
function calculateElementDepths(elements) {
    elements.forEach(elem => {
        let depth = 0;
        // @ts-ignore
        let el = elem.parentElement ?? elem.getRootNode()?.host ?? null;
        while (el) {
            if (el.nodeName.includes('-')) {
                depth++;
            }
            // @ts-ignore
            el = el.parentElement ?? el.getRootNode()?.host ?? null;
        }
        elem[ELEMENT_DEPTH] = depth;
    });
}

function getScrollingParent(elem) {
    if (elem == null) {
        return null;
    }
    if (elem.scrollHeight > elem.clientHeight) {
        return elem;
    } else {
        return getScrollingParent(elem.parentNode ?? elem.host);
    }
}

/**
 * @param {number} index
 * @returns { HTMLElement }
 */
export function getElementByIndex(index) {
    /** @type {import("./element-parser.js").FoundElementWithRefFields} */
    const elements = window[FOUND_ELEMENTS];

    const spotlitElement = elements[index]?.element;
    return spotlitElement;
}

// Quick and dirty way to append code on the page
// We could do better

export const finderScriptsInject = `
let iframeAccessWasBlocked = false;
let iframeAccessHasBeenLogged = false;
${findCustomElements.toString()}
${calculateElementDepths.toString()}
${findAllElements.toString()}
${getElementByIndex.toString()}
${getScrollingParent.toString()}
${getCachedFoundElements.toString()}
${findElementsOnPage.toString()}
`;
