import { getBaseUrl, getCustomElementsManifestUrl, getPackageJsonUrl, isDevMode } from './custom-elements-helpers';

let PACKAGE_JSON = null;
const DEP_IGNORE_CACHE = [];

/**
 * @param { String } baseUrl
 *
 * @returns {Promise<import('custom-elements-manifest/schema').Package | null>}
 * */
export async function fetchManifest(baseUrl) {
    let manifestUrl;
    if (isDevMode()) {
        const packageJsonUrl = getPackageJsonUrl(baseUrl);
        PACKAGE_JSON = await fetchPackageJson(packageJsonUrl);
        let customElementsPath = PACKAGE_JSON ? PACKAGE_JSON.customElements : '';
        if (customElementsPath && customElementsPath.length > 0) {
            manifestUrl = getManifestUrlRelativeToPackageJson(packageJsonUrl, customElementsPath);
        } else {
            manifestUrl = getCustomElementsManifestUrl(baseUrl);
        }
    } else {
        manifestUrl = getCustomElementsManifestUrl(baseUrl);
    }

    const manifest = await fetchCustomElementsJson(manifestUrl, baseUrl);
    if (!manifest) {
        console.warn(`[WebComponentDevTools]: Could not find custom-elements.json from ${manifestUrl}`);
        return null;
    }

    return manifest;
}

function getManifestUrlRelativeToPackageJson(packageUrl, manifestPath) {
    return packageUrl.replace('package.json', manifestPath);
}

/**
 * @param {string} [packageUrl]
 */
export async function fetchPackageJson(packageUrl) {
    if (!packageUrl) {
        packageUrl = getPackageJsonUrl();
    }

    return await fetch(packageUrl)
        .then(res => res.json())
        .catch(err => {
            return null;
        });
}

/**
 * @param {string} [manifestUrl]
 * @param {string} [baseUrl]
 */
export async function fetchCustomElementsJson(manifestUrl, baseUrl) {
    if (!manifestUrl) {
        manifestUrl = getBaseUrl(baseUrl) + '/custom-elements.json';
    }
    return await fetch(manifestUrl)
        .then(res => res.json())
        .catch(err => {
            return null;
        });
}

/**
 * When in a local dev environment, we want to be able to get the dependency CEM's too
 * @param {string} baseUrl
 */
export async function fetchExternalLibraryManifests(baseUrl) {
    const manifests = [];
    const origin = getBaseUrl(baseUrl);
    if (!isDevMode() || !PACKAGE_JSON) return manifests;

    const dependencies = PACKAGE_JSON.dependencies ?? [];
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
