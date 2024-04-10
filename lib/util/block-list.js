
export const NOT_INCLUDED_URLS = [
    "chrome://",
    "youtube.com"
];

/**
 * @param {string} siteUrl
 */
export function siteIsOnBlockList(siteUrl) {
    return NOT_INCLUDED_URLS.some(url => siteUrl.includes(url));
}
