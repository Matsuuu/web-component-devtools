import browser from "webextension-polyfill";
import { analyzeDomElement } from "./custom-element-dom-analyzer";

export async function queryElementDataFromWindow(elementName: string, tabId: number) {
    const scriptResult = await browser.scripting.executeScript({
        target: { tabId },
        args: [elementName],
        func: analyzeDomElement,
        world: "MAIN",
    });

    return scriptResult[0].result ?? scriptResult[0].error;
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
