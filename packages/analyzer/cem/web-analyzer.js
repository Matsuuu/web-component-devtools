import { ts, create, litPlugin, fastPlugin } from '@custom-elements-manifest/analyzer/browser/index';
import { findModuleByCustomElementTagName, isCustomElementExport } from './custom-elements-helpers';
import { declarationToManifestDataEntry, mergeManifestDatas } from './custom-elements-manifest-parser';
import { getLocalCEM } from './web-fetcher';

let analyzedScripts = {};
let fetchedSources = {};
let fullPageManifests = {};

export function resetAnalyzer(tabId) {
    if (!tabId) {
        fullPageManifests = {};
        analyzedScripts = {};
        fetchedSources = {};
    } else {
        delete fullPageManifests[tabId];
        analyzedScripts = {};
        fetchedSources = {};
    }
}

function isAbsoluteUrl(url) {
    return url.match(/http(s|):\/\//);
}

/**
 * @param {string | number} tabId
 */
function getFullPageManifest(tabId) {
    return fullPageManifests[tabId];
}

/**
 * @param {DevToolsElement} elementData
 * @param {string} origin
 * @param {string | number} tabId
 */
export async function analyzeAndUpdateElement(elementData, origin, tabId) {
    const manifest = getFullPageManifest(tabId);
    let elementModule = findModuleByCustomElementTagName(manifest, elementData.tagName);

    if (!elementModule) {
        // If we can't find the definition of the element, get what we can and exit eary
        await updateElementDataViaAnalysis(elementData, origin);
        return;
    }
    await updateElementDataFromManifest(elementData, elementModule, origin, manifest);
}

/**
 * @param {string} sourcePath
 */
async function fetchSource(sourcePath) {
    const fixedUrl = fixModuleUrl(sourcePath);
    const sourceUrl = new URL(fixedUrl);
    sourcePath = sourceUrl.href;

    if (fetchedSources[sourcePath]) {
        return await fetchedSources[sourcePath];
    }
    const fetchProm = new Promise(async resolve => {
        let sourceCode;
        try {
            sourceCode = await fetch(sourcePath).then(res => res.text());
        } catch (err) {
            return resolve('');
        }
        fetchedSources[sourcePath] = sourceCode;
        resolve(sourceCode);
    });
    fetchedSources[sourcePath] = fetchProm;
    return fetchProm;
}

/**
 * Fetch all scripts loaded on the page, analyze them and add them to CEM.
 *
 * @param {any} sources
 * @param {any} inlineSources
 * @param {string} origin
 * @param {string | number} tabId
 */
export async function analyzeAllScripts(sources, inlineSources, origin, fullPath, tabId) {
    if (fullPageManifests[tabId]) return fullPageManifests[tabId];

    let manifest = await createManifest('', []);
    manifest.modules = [];
    for (const scriptPath of sources) {
        const scriptSource = await fetchSource(scriptPath);
        const modules = await analyzeScript(scriptPath, scriptSource);

        if (getDeclarationAndExportCount(modules) > 0) {
            manifest.modules = [...manifest.modules, ...modules];
        }
    }
    for (const inlineSource of inlineSources) {
        const modules = await analyzeScript(origin + "/", inlineSource);

        if (getDeclarationAndExportCount(modules) > 0) {
            manifest.modules = [...manifest.modules, ...modules];
        }
    }


    await addLocalCEM(manifest, origin, fullPath);
    fullPageManifests[tabId] = manifest;
    return fullPageManifests[tabId];
}

// TODO
async function addLocalCEM(manifest, origin, fullPath) {
    const localCEM = await getLocalCEM(origin, fullPath);
    const manifestUrlMap = {};
    manifest.modules.forEach(mod => manifestUrlMap[mod.path] = mod);

    if (localCEM) {
        for (const mod of localCEM.modules) {
            let modPath = mod.path;
            if (!isAbsoluteUrl(modPath)) {
                modPath = origin + "/" + modPath;
            }

            if (manifestUrlMap[modPath]) {
                const existingMod = manifestUrlMap[modPath];
                for (const localCEMDeclaration of mod.declarations) {
                    const existingDeclaration = existingMod.declarations.find(dec => dec.name === localCEMDeclaration.name);
                    if (existingDeclaration) {
                        existingDeclaration.members = [...existingDeclaration.members, ...localCEMDeclaration.members];
                    } else {
                        existingMod.declarations.push(localCEMDeclaration);
                    }
                }
            }
        }
    }
}

/**
 * @param {any} modules
 */
function getDeclarationAndExportCount(modules) {
    let declarationCount = 0;
    let exportCount = 0;

    for (const mod of modules) {
        const decName = mod.declarations?.[0]?.name;
        if (decName === 'SpotlightBorder') break;
        declarationCount += mod.declarations.length;
        exportCount += mod.exports.length;
    }

    return declarationCount + exportCount;
}

/**
 * Analyze source script. Add found modules to manifest
 *
 * @param {string} scriptPath
 * @param {string} scriptSource
 */
async function analyzeScript(scriptPath, scriptSource) {
    if (scriptPath.toString().length <= 0) return [];
    if (isAnalyzed(scriptPath)) return analyzedScripts[scriptPath];

    // Mark it as analyzed ahead of time since this is a recursive action
    // through the createManifest process.
    analyzedScripts[scriptPath] = [];
    const mani = await createManifest(scriptSource, [], scriptPath);
    // Mark the actual modules later on as we actually have them
    analyzedScripts[scriptPath] = mani.modules;

    return mani.modules;
}

/**
 * @param {string} scriptPath
 */
function isAnalyzed(scriptPath) {
    return typeof analyzedScripts[scriptPath] !== 'undefined';
}

/**
 * @param {Array<import('custom-elements-manifest/schema').Export>} exports
 * @param {string} tagName
 * @param {string} origin
 * @param {any} manifest
 */
async function fetchExportModule(exports, tagName, origin, manifest) {
    const definitionExport = exports.find(ex => isCustomElementExport(ex) && ex.name === tagName);

    let moduleSourcePath = fixModuleUrl(definitionExport?.declaration?.module);
    if (moduleSourcePath) {
        if (!isAbsoluteUrl(moduleSourcePath)) {
            moduleSourcePath = origin + moduleSourcePath;
        }
        if (isAnalyzed(moduleSourcePath)) {
            return [manifest.modules.find(mod => mod.path === moduleSourcePath)]
        }
        const declarationModuleSource = await fetchSource(moduleSourcePath);
        return await analyzeScript(moduleSourcePath, declarationModuleSource);
    }

    return [];
}


/**
 * @param {string} moduleUrl
 */
function fixModuleUrl(moduleUrl) {
    if (!moduleUrl) return moduleUrl;
    moduleUrl = moduleUrl.trim();
    while (moduleUrl.includes("http") && moduleUrl.startsWith("/")) {
        moduleUrl = moduleUrl.substring(1);
    }
    return moduleUrl;
}

/**
 * @param {Array<import('custom-elements-manifest/schema').JavaScriptModule>} modules
 */
function flatDeclarations(modules) {
    return modules.reduce((acc, mod) => (acc = [...acc, ...mod.declarations]), []);
}

/**
 * @param {DevToolsElement} elementData
 * @param {string} origin
 */
async function updateElementDataViaAnalysis(elementData, origin) {
    // If we can't find the definition of the element, get what we can and exit early
    const elementManifest = await createManifest(elementData.declaration, getNeededPlugins(elementData), origin);
    let elementDeclaration = getDeclaration(elementManifest.modules[0], '') || elementManifest.modules[0].declarations[0];
    const manifestDataEntry = declarationToManifestDataEntry(elementData.tagName, elementDeclaration);
    mergeManifestDatas(elementData, manifestDataEntry);
}

/**
 * @param {DevToolsElement} elementData
 * @param {import('custom-elements-manifest/schema').JavaScriptModule} elementModule
 * @param {string} origin
 * @param {any} manifest
 */
async function updateElementDataFromManifest(elementData, elementModule, origin, manifest) {
    // If the module is just a export/declaration and not the class itself
    if (elementModule.declarations?.length <= 0) {
        const modules = await fetchExportModule(elementModule.exports, elementData.tagName, origin, manifest);
        elementModule.declarations = flatDeclarations(modules);
    }
    const definitionExport = elementModule.exports.find(
        ex => isCustomElementExport(ex) && ex.name === elementData.tagName,
    );

    const elementDeclaration = getDeclaration(elementModule, definitionExport.declaration.name);

    const manifestDataEntry = declarationToManifestDataEntry(elementData.tagName, elementDeclaration);
    mergeManifestDatas(elementData, manifestDataEntry);
    if (elementDeclaration?.superclass) {
        await inheritSuperclasses(elementData, elementDeclaration.superclass, manifest);
    }
}

/**
 * @param {DevToolsElement} elementData
 * @param {import("custom-elements-manifest/schema").Reference} parentReference
 * @param {any} manifest
 */
async function inheritSuperclasses(elementData, parentReference, manifest) {
    const declarations = flatDeclarations(manifest.modules);
    const parentDeclaration = declarations.find(dec => dec.name === parentReference.name);

    if (parentDeclaration) {
        const parentManifestDataEntry = declarationToManifestDataEntry(elementData.tagName, parentDeclaration);
        mergeManifestDatas(elementData, parentManifestDataEntry, parentReference);
        if (parentManifestDataEntry.parentClass) {
            await inheritSuperclasses(elementData, parentManifestDataEntry.parentClass, manifest);
        }
    }
}

/**
 * @param {import("custom-elements-manifest/schema").JavaScriptModule} elementModule
 * @param {string} className
 *
 * @returns {import('custom-elements-manifest/schema').CustomElement}
 */
function getDeclaration(elementModule, className) {
    return /** @type { import('custom-elements-manifest/schema').CustomElement } */ (
        elementModule?.declarations?.find(dec => dec.name === className)
    );
}

/**
 * @param {string} source
 * @param {Array<any>} neededPlugins
 * @param {string} [sourcePath]
 */
export async function createManifest(source, neededPlugins, sourcePath) {
    sourcePath = fixModuleUrl(sourcePath);
    try {
        const modules = [ts.createSourceFile(sourcePath ?? '', source, ts.ScriptTarget.ES2015, true)];

        const importStatements = modules[0].statements.filter(stat => stat.kind === ts.SyntaxKind.ImportDeclaration && stat.moduleSpecifier !== undefined);
        const exportStatements = modules[0].statements.filter(stat => stat.kind === ts.SyntaxKind.ExportDeclaration && stat.moduleSpecifier !== undefined);
        const importPaths = [...importStatements.map(is => is.moduleSpecifier.text), ...exportStatements.map(es => es.moduleSpecifier.text)];

        const manifest = create({
            modules,
            plugins: neededPlugins,
            dev: false,
        });

        for (const ip of importPaths) {
            // If the importpath is a full url, don't create a base
            const base = isAbsoluteUrl(ip) ? "" : sourcePath.substring(0, sourcePath.lastIndexOf('/'));
            const srcPath = new URL(fixModuleUrl(base + '/' + ip)).href;
            if (!isAnalyzed(srcPath)) {
                const src = await fetchSource(srcPath);
                const modules = await analyzeScript(srcPath, src);
                if (getDeclarationAndExportCount(modules) > 0) {
                    manifest.modules = [...manifest.modules, ...modules];
                }
            }
        }

        // We don't need other declarations, se we can just filter  them out
        manifest.modules.forEach(mod => {
            mod.declarations = mod.declarations.filter(dec => dec.kind === 'class' || dec.kind === 'mixin');
        });

        return manifest;
    } catch (err) {
        console.warn("CEM Analyzer crash: ", err);
        return { modules: [] };
    }
}
function getNeededPlugins(elementData) {
    // Get the id's from /lib/crawler/element-types.js
    switch (elementData?.typeInDevTools?.id) {
        case 1:
            return [...litPlugin()];
        case 2:
            return [...fastPlugin()];
        default:
            return [];
    }
}
