import { ScriptEntry } from "./client-javascript-parser";
// TODO: We need to also pre-bundle the analyzer I guess since it uses TS
// import { create, litPlugin } from "@custom-elements-manifest/analyzer/browser/index";

export function analyzeScriptEntries(scriptEntries: ScriptEntry[]) {
    console.log("[analyzeScriptEntries]", scriptEntries);

    // const manifest = create({
    //     modules: scriptEntries.map(script => script.sourceFile),
    //     plugins: [...litPlugin()],
    //     context: { dev: false },
    // });

    // console.log("Manifest ", manifest);
}
