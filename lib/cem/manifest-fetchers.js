import { isDevMode } from './custom-elements-helpers';

let PACKAGE_JSON = null;
const DEP_IGNORE_CACHE = [];
const CEM_CACHE = {};

/**
 * @returns {Promise<import('custom-elements-manifest/schema').Package | null>}
 * */
export async function fetchManifest() {
    const origin = window.location.origin;
    const packageUrl = origin + '/package.json';

    if (CEM_CACHE[packageUrl]) return CEM_CACHE[packageUrl];

    let manifestUrl;
    if (isDevMode()) {
        PACKAGE_JSON = await fetch(packageUrl)
            .then(res => res.json())
            .catch(err => {
                return null;
            });
        if (!PACKAGE_JSON) return null;
        manifestUrl = origin + '/' + PACKAGE_JSON.customElements;
    } else {
        manifestUrl = origin + '/custom-elements.json';
    }

    const manifest = await fetch(manifestUrl)
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                return Promise.resolve(res);
            } else {
                return Promise.reject(res.status.toString());
            }
        })
        .then(res => {
            if (res) return res.json();
            return res;
        })
        .catch(err => console.warn('[WebComponentDevTools]: Could not find custom-elements.json'));
    if (manifest) {
        CEM_CACHE[packageUrl] = manifest;
    }
    return manifest;
}

/**
 * When in a local dev environment, we want to be able to get the dependency CEM's too
 * */
export async function fetchExternalLibraryManifests() {
    const manifests = [];
    const origin = window.location.origin;
    if (!isDevMode() || !PACKAGE_JSON) return manifests;

    const dependencies = PACKAGE_JSON.dependencies;
    for (const dep of Object.keys(dependencies)) {
        if (DEP_IGNORE_CACHE.includes(dep)) continue; // We've scanned that there is not CEM so ignore it

        const depPackageJson = await fetch(origin + '/node_modules/' + dep + '/package.json').then(res => res.json());
        const customElementsPath = depPackageJson.customElements;
        if (customElementsPath) {
            const externalLibManifestPath = origin + '/node_modules/' + dep + '/' + customElementsPath;
            const externalLibManifest = await fetch(externalLibManifestPath).then(res => res.json());
            manifests.push(externalLibManifest);
        } else {
            DEP_IGNORE_CACHE.push(dep);
        }
    }

    return manifests;
}
