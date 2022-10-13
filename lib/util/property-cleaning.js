/**
 * The data inheritance process isn't completely clean, and
 * therefore we need to do some small housekeeping to the elements
 *
 * @param { DevToolsElement } elementData
 * */
export function cleanUpData(elementData) {
    cleanDuplicates(elementData, 'properties');
    cleanDuplicates(elementData, 'attributes');
    cleanDuplicates(elementData, 'events');
    cleanDuplicates(elementData, 'methods');
}

/**
 * @param { DevToolsElement } elementData
 * @param { string } field
 */
function cleanDuplicates(elementData, field) {
    if (!elementData || !elementData[field]) return;
    const seen = {};
    // For firefox instances we need to access it via this API
    if (elementData.wrappedJSObject) {
        elementData.wrappedJSObject[field] = elementData[field].filter(
            (/** @type { import('custom-elements-manifest/schema').ClassMember } */ prop) => {
                const propName = prop?.name?.replace('__', '');
                if (!propName || seen[propName]) return false;
                seen[propName] = prop;
                return true;
            },
        );
    } else {
        elementData[field] = elementData[field].filter(
            (/** @type { import('custom-elements-manifest/schema').ClassMember } */ prop) => {
                const propName = prop?.name?.replace('__', '');
                if (!propName || seen[propName]) return false;
                seen[propName] = prop;
                return true;
            },
        );
    }
}

