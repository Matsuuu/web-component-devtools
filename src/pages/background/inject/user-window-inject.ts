import browser from "webextension-polyfill";
import { ScriptEntry } from "../messaging/client-javascript-parser";

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

export async function queryAllScriptsFromWindow(tabId: number): Promise<ScriptEntry[]> {
    const scriptResult = await browser.scripting.executeScript({
        target: { tabId },
        args: [],
        func: () => {
            return [...document.querySelectorAll("script")] //
                .map(script => ({
                    src: script.src,
                    content: script.innerHTML,
                }));
        },
        //world: "MAIN",
    });

    return scriptResult[0].result as ScriptEntry[];
}
