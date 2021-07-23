import { ts, create, litPlugin, fastPlugin } from "@custom-elements-manifest/analyzer/browser/index";
import { ELEMENT_TYPES } from "../crawler/element-types";
import { declarationToManifestDataEntry, mergeManifestDatas } from "./custom-elements-manifest-parser";

export function analyzeAndUpdateElement(elementData) {
    const modules = [ts.createSourceFile(
        '',
        elementData.declaration,
        ts.ScriptTarget.ES2015,
        true
    )];

    const manifest = create({
        modules,
        plugins: getNeededPlugins(elementData),
        dev: false
    });

    const declarationData = manifest?.modules?.[0]?.declarations?.[0];
    const manifestDataEntry = declarationToManifestDataEntry(elementData.tagName, declarationData);
    mergeManifestDatas(elementData, manifestDataEntry, false);
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
