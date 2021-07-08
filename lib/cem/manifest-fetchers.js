import { getCustomElementsManifestUrl, getPackageJsonUrl, isDevMode } from './custom-elements-helpers';

let PACKAGE_JSON = null;
const DEP_IGNORE_CACHE = [];
// We cache the found CEM's so we don't fetch them twice.
const CEM_CACHE = {};

/**
 * @returns {Promise<import('custom-elements-manifest/schema').Package | null>}
 * */
export async function fetchManifest() {
    const packageJsonUrl = getPackageJsonUrl();
    if (CEM_CACHE[packageJsonUrl]) return CEM_CACHE[packageJsonUrl];

    let manifestUrl;
    if (isDevMode()) {
        PACKAGE_JSON = await fetchPackageJson();
        let customElementsPath = PACKAGE_JSON ? PACKAGE_JSON.customElements : "";
        if (customElementsPath.length > 0) {
            manifestUrl = getManifestUrlRelativeToPackageJson(packageJsonUrl, customElementsPath);
        } else {
            manifestUrl = getCustomElementsManifestUrl();
        }
    } else {
        manifestUrl = getCustomElementsManifestUrl();
    }

    const manifest = await fetchCustomElementsJson(manifestUrl);
    if (!manifest) {
        console.warn(`[WebComponentDevTools]: Could not find custom-elements.json from ${manifestUrl}`);
        return null;
    }

    CEM_CACHE[packageJsonUrl] = manifest;
    return manifest;
}

function getManifestUrlRelativeToPackageJson(packageUrl, manifestPath) {
    return packageUrl.replace("package.json", manifestPath);
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
 */
export async function fetchCustomElementsJson(manifestUrl) {
    if (!manifestUrl) {
        manifestUrl = origin + '/custom-elements.json';
    }
    return await fetch(manifestUrl)
        .then(res => res.json())
        .catch(err => {
            return null;
        });
}

/**
 * When in a local dev environment, we want to be able to get the dependency CEM's too
 * */
export async function fetchExternalLibraryManifests() {
    const manifests = [];
    const origin = window.location.origin;
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
