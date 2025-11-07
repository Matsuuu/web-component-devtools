import { getTS } from "../ts/ts";

export interface ScriptEntry {
    src?: string;
    content?: string;
}

export async function parseClientJavascriptCode(scripts: ScriptEntry[]) {
    console.log("SCRIPTSSSS: ", scripts);

    // Populate scripts with the actual data
    for (const script of scripts) {
        if ((!script.content || script.content.length <= 0) && script.src) {
            try {
                const res = await fetch(script.src);
                const scriptContent = await res.text();
                script.content = scriptContent;
            } catch (ex) {
                // Ignored for now
            }
        }
    }

    const ts = await getTS();

    const sourceFile = ts.createSourceFile(
        scripts[0].src || "",
        scripts[0].content || "",
        ts.ScriptTarget.ES2015,
        true,
    );
    console.log(sourceFile);
}
