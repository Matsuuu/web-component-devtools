const SUPPORTED_TYPES = ['string', 'number', 'boolean', 'array', 'undefined'];

export function determinePropertyType(property, value) {
    const typeText = property?.type?.text;
    const isArray = Array.isArray(value);
    if (typeText) {
        // Escape early if we have a union type
        if (isUnionType(typeText)) {
            return 'union';
        }
        // If we have a manifest (or otherwise gained) type, but
        // it's none of the primitive types we support, we can
        // quite safely expect that it's a custom class,
        // and therefore a Javascript Object or an array
        if (!SUPPORTED_TYPES.includes(typeText)) {
            if (isArray) return 'array';
            return 'object';
        } else {
            return typeText;
        }
    }
    // Fall back to using the type of the value, or a string if nothing else works
    return isArray ? 'array' : typeof value ?? 'string';
}

function isUnionType(typeText) {
    return typeText.includes("|");
}
