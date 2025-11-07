import browser from "webextension-polyfill";
import { ScriptEntry } from "../parsing/client-javascript-parser";

export async function queryCustomElementClassCodeFromWindow(customElementName: string, tabId: number) {
    const scriptResult = await browser.scripting.executeScript({
        target: { tabId },
        args: [customElementName],
        func: (elementName: string) => {
            return window.customElements.get(elementName)?.toString();
        },
        world: "MAIN",
    });

    return scriptResult[0].result ?? scriptResult[0].error;
}

export interface ScriptQueryResult {
    origin: string;
    scripts: ScriptEntry[];
}

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
