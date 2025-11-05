export function stylizeNodeText(nodeText: string, isCustomElement: boolean) {
    // Match opening tag and its attributes
    const tagMatch = nodeText.match(/^<([\w-]+)([^>]*)>/);
    if (!tagMatch) return nodeText; // fallback

    const [, tagName, attrsPart] = tagMatch;

    const tagClasses = isCustomElement ? "tag custom-element" : "tag";

    // Wrap the tag name
    let styled = `<span class="${tagClasses}">&lt;${tagName}</span>`;

    // Match all attributes (key="value" or key='value')
    const attrRegex = /([\w-:]+)\s*=\s*(".*?"|'.*?')/g;
    let match;
    while ((match = attrRegex.exec(attrsPart))) {
        const [, key, value] = match;
        styled += ` <span class="attr-key">${key}</span>=<span class="attr-value">${value}</span>`;
    }

    styled += `<span class="${tagClasses}">&gt;</span>`;

    return styled;
}
