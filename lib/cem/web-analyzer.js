import { ts, create, litPlugin, fastPlugin } from '@custom-elements-manifest/analyzer/browser/index';
import { ELEMENT_TYPES } from '../crawler/element-types';
import { findModuleByCustomElementTagName, isCustomElementExport } from './custom-elements-helpers';
import { declarationToManifestDataEntry, mergeManifestDatas } from './custom-elements-manifest-parser';

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
    await updateElementDataFromManifest(elementData, elementModule);
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
 * @param {string | number} tabId
 */
export async function analyzeAllScripts(sources, tabId) {
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
    fullPageManifests[tabId] = manifest;
    return fullPageManifests[tabId];
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
    if (analyzedScripts[scriptPath]) return analyzedScripts[scriptPath];

    const mani = await createManifest(scriptSource, [], scriptPath);
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
 */
async function fetchExportModule(exports, tagName) {
    const definitionExport = exports.find(ex => isCustomElementExport(ex) && ex.name === tagName);

    let moduleSourcePath = definitionExport?.declaration?.module;
    if (moduleSourcePath) {
        const declarationModuleSource = await fetchSource(moduleSourcePath);
        return analyzeScript(moduleSourcePath, declarationModuleSource);
    }

    return [];
}

/**
 * @param {string} parentModule
 */
async function fetchParentModule(parentModule) {
    if (parentModule) {
        const scriptSource = await fetchSource(parentModule);
        return analyzeScript(parentModule, scriptSource);
    }
    return [];
}

/**
 * @param {string} moduleUrl
 */
function fixModuleUrl(moduleUrl) {
    if (!moduleUrl) return moduleUrl;
    moduleUrl = moduleUrl.trim();
    return moduleUrl.startsWith('/http') ? moduleUrl.substring(1) : moduleUrl;
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
    // If we can't find the definition of the element, get what we can and exit eary
    const elementManifest = await createManifest(elementData.declaration, getNeededPlugins(elementData), origin);
    const elementDeclaration = getDeclaration(elementManifest.modules[0], '');
    const manifestDataEntry = declarationToManifestDataEntry(elementData.tagName, elementDeclaration);
    mergeManifestDatas(elementData, manifestDataEntry);
}

/**
 * @param {DevToolsElement} elementData
 * @param {import('custom-elements-manifest/schema').JavaScriptModule} elementModule
 * */
async function updateElementDataFromManifest(elementData, elementModule) {
    // If the module is just a export/declaration and not the class itself
    if (elementModule.declarations?.length <= 0) {
        const modules = await fetchExportModule(elementModule.exports, elementData.tagName);
        elementModule.declarations = flatDeclarations(modules);
    }
    const definitionExport = elementModule.exports.find(
        ex => isCustomElementExport(ex) && ex.name === elementData.tagName,
    );

    const elementDeclaration = getDeclaration(elementModule, definitionExport.declaration.name);

    const manifestDataEntry = declarationToManifestDataEntry(elementData.tagName, elementDeclaration);
    mergeManifestDatas(elementData, manifestDataEntry);
    if (elementDeclaration?.superclass) {
        await inheritSuperclasses(elementData, elementDeclaration.superclass);
    }
}

/**
 * @param {DevToolsElement} elementData
 * @param {import("custom-elements-manifest/schema").Reference} parentReference
 */
async function inheritSuperclasses(elementData, parentReference) {
    const modules = await fetchParentModule(parentReference?.module);
    const declarations = flatDeclarations(modules);
    const parentDeclaration = declarations.find(dec => dec.name === parentReference.name);

    if (parentDeclaration) {
        const parentManifestDataEntry = declarationToManifestDataEntry(elementData.tagName, parentDeclaration);
        mergeManifestDatas(elementData, parentManifestDataEntry, parentReference);
        if (parentManifestDataEntry.parentClass) {
            await inheritSuperclasses(elementData, parentManifestDataEntry.parentClass);
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
    const modules = [ts.createSourceFile(sourcePath ?? '', source, ts.ScriptTarget.ES2015, true)];

    const importStatements = modules[0].statements.filter(stat => stat.kind === ts.SyntaxKind.ImportDeclaration);
    const importPaths = importStatements.map(is => is.moduleSpecifier.text);

    const manifest = create({
        modules,
        plugins: neededPlugins,
        dev: false,
    });

    for (const ip of importPaths) {
        const base = sourcePath.substring(0, sourcePath.lastIndexOf('/'));
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
}
function getNeededPlugins(elementData) {
    switch (elementData.typeInDevTools) {
        case ELEMENT_TYPES.LIT:
            return [...litPlugin()];
        case ELEMENT_TYPES.FAST:
            return [...fastPlugin()];
        default:
            return [];
    }
}
