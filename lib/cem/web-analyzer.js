import { ts, create, litPlugin, fastPlugin } from "@custom-elements-manifest/analyzer/browser/index";
import { ELEMENT_TYPES } from "../crawler/element-types";
import { declarationToManifestDataEntry } from "./custom-elements-manifest-parser";

export function analyzeAndUpdateElement(elementData) {
    const modules = [ts.createSourceFile(
        '',
        elementData.declaration,
        ts.ScriptTarget.ES2015,
        true
    )];
    console.log(modules);

    const manifest = create({
        modules,
        plugins: getNeededPlugins(elementData),
        dev: false
    });

    console.log(manifest);
    const declarationData = manifest?.modules?.[0]?.declarations?.[0];
    const manifestDataEntry = declarationToManifestDataEntry(elementData.tagName, declarationData);
    console.log("Mani data entry", manifestDataEntry);
    // TODO: Combine te manifest data entry wit the element data.
    // All of the methods should be in the parser already.
    // This is just waiting for the fix to minified code to get shipped
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
