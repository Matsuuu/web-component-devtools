import browser from "webextension-polyfill";
import { DomAnalyzedElement, StaticAnalyzedElement } from "../../../lib/analyzer/analyzed-element";
import { TreeElement } from "@src/pages/content/lib/element";

export interface ScriptQueryResult {
    origin: string;
}

// We might not need this if we end up not parsing CEM's ourselves.
export async function queryAllScriptsFromWindow(tabId: number): Promise<ScriptQueryResult> {
    const scriptResult = await browser.scripting.executeScript({
        target: { tabId },
        args: [],
        func: () => {
            const origin = window.location.origin;
            return {
                origin,
                scripts: [...document.querySelectorAll("script")] //
                    .map(script => ({
                        src: script.src,
                        parent: origin,
                        content: script.innerHTML,
                    })),
            };
        },
        //world: "MAIN",
    });

    return scriptResult[0].result as ScriptQueryResult;
}
