import { ScriptEntry } from "./client-javascript-parser";
// TODO: We need to also pre-bundle the analyzer I guess since it uses TS
// import { create } from "@custom-elements-manifest/analyzer/src/create";
// import { ts, litPlugin } from "@custom-elements-manifest/analyzer/browser/index";

export function analyzeScriptEntries(scriptEntries: ScriptEntry[]) {
    console.log("[analyzeScriptEntries]", scriptEntries);

    //    const modules = scriptEntries.map(script =>
    //        ts.createSourceFile(script.src || "", script.content || "", ts.ScriptTarget.ES2015, true),
    //    );

    //    const manifest = create({
    //        //modules: scriptEntries.map(script => script.sourceFile),
    //        modules,
    //        plugins: [...litPlugin()],
    //        context: { dev: false },
    //    });

    //    console.log("Manifest ", manifest);
}
