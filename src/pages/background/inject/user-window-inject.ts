import browser from "webextension-polyfill";
import { analyzeDomElement } from "./custom-element-dom-analyzer";
import { DomAnalyzedElement, StaticAnalyzedElement } from "../parsing/analyzed-element";
import { TreeElement } from "@src/pages/content/lib/element";

export async function queryElementDataFromWindow(elementName: string, tabId: number) {
    const scriptResult = await browser.scripting.executeScript({
        target: { tabId },
        args: [elementName],
        func: analyzeDomElement,
        world: "MAIN",
    });

    return scriptResult[0].result as StaticAnalyzedElement;
}

export async function queryElementDomData(element: TreeElement, tabId: number) {
    const scriptResult = await browser.scripting.executeScript({
        target: { tabId },
        args: [element],
        func: element => {
            // TODO: We need to have the direct DOM element ref here too.
            // TODO: Could we just give the selected element a unique data attribute and then query that?
            console.log(element);
        },
        world: "MAIN",
    });

    return scriptResult[0].result as DomAnalyzedElement;
}

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
