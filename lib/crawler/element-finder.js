import { ELEMENT_DEPTH, FOUND_ELEMENTS } from './crawler-constants.js';
import { elementHasShadowRoot, getElementNodeName } from './crawler-utils.js';
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
    if (!elem) return [];

    let elements = /** @type { Array<HTMLElement> } */ (Array.from(elem.querySelectorAll('*')));

    let allElements = [];
    for (const e of elements) {
        allElements.push(e);
        if (elementHasShadowRoot(e)) {
            allElements = [...allElements, ...findAllElements(e.shadowRoot)];
        }
        if (getElementNodeName(e) === 'IFRAME') {
            try {
                // @ts-ignore
                allElements = [...allElements, ...findAllElements(e.contentWindow.document)];
            } catch (err) {
                // Couldn't access iframe
                iframeAccessWasBlocked = true;
            }
        }
    }

    return allElements.filter(
        elem =>
            getElementNodeName(elem).includes('-') &&
            getElementNodeName(elem).toLowerCase() !== 'wc-devtools-spotlight-border',
    );
}

export function findElementsOnPage() {
    let customElements = findCustomElements();
    console.log(customElements);
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

    const spotlitElement = elements?.[index]?.element;
    return spotlitElement;
}
