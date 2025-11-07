import { getTS } from "../ts/ts";
import type typescript from "typescript";

export interface ScriptEntry {
    src?: string;
    content?: string;
    sourceFile?: typescript.SourceFile;
}

const ts = getTS();

export async function parseClientJavascriptCode(scripts: ScriptEntry[], origin: string): Promise<ScriptEntry[]> {
    const fetchers = scripts.map(script => fetchScriptTagContent(script, origin));
    await Promise.all(fetchers);

    const allScripts = [...scripts];

    const parsers = scripts.map(script =>
        parseJavascriptFileAndAddFoundScriptEntries(script, origin, script.src, allScripts),
    );
    await Promise.all(parsers);

    return allScripts;
}

async function parseJavascriptFileAndAddFoundScriptEntries(
    script: ScriptEntry,
    origin: string,
    parentScript: string = "[no-source, inline script]",
    entries: ScriptEntry[],
) {
    const sourceFile = ts.createSourceFile(script.src || "", script.content || "", ts.ScriptTarget.ES2015, true);
    script.sourceFile = sourceFile;

    const imports = sourceFile.statements.filter(isImportDeclaration);

    const importScripts = [
        //
        ...imports.map(imp => imp.moduleSpecifier.getText()),
        ...findAllDynamicImportPaths(sourceFile),
    ];

    const newScripts: ScriptEntry[] = importScripts.map(imp => ({
        src: stripQuotes(imp),
        parent: parentScript,
    }));
    const fetchers = newScripts.map(script => fetchScriptTagContent(script, origin));
    await Promise.all(fetchers);

    // Push instead of spread since we want to mutate the array, not rewrite it
    newScripts.forEach(script => entries.push(script));

    // Finally, we recursively parse found files so we get the full picture
    const newScriptParsers = newScripts.map(script =>
        parseJavascriptFileAndAddFoundScriptEntries(script, origin, script.src, entries),
    );
    await Promise.all(newScriptParsers);
}

function stripQuotes(text: string) {
    let newText = text;
    if (newText.startsWith('"')) {
        newText = newText.substring(1);
    }
    if (newText.endsWith('"')) {
        newText = newText.substring(0, newText.length - 1);
    }

    return newText;
}

function isImportDeclaration(statement: typescript.Statement): statement is typescript.ImportDeclaration {
    return statement.kind === ts.SyntaxKind.ImportDeclaration;
}

function findAllDynamicImportPaths(sourceFile: typescript.SourceFile) {
    const importCallExpressions: typescript.CallExpression[] = [];

    function visit(node: typescript.Node) {
        if (node.kind === ts.SyntaxKind.ImportKeyword && isCallExpression(node.parent)) {
            importCallExpressions.push(node.parent);
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return importCallExpressions
        .filter(ce => ce.arguments[0].kind === ts.SyntaxKind.StringLiteral)
        .map(ce => ce.arguments[0].getText());
}

function isCallExpression(statement: typescript.Node): statement is typescript.CallExpression {
    return statement.kind === ts.SyntaxKind.CallExpression;
}

async function fetchScriptTagContent(script: ScriptEntry, origin: string) {
    if ((!script.content || script.content.length <= 0) && script.src) {
        const url = scriptEntryToUrl(script, origin);

        if (!url) {
            console.warn("Failed to form URL for ", script.src);
            return;
        }

        try {
            const res = await fetch(url);
            const scriptContent = await res.text();
            script.content = scriptContent;
        } catch (ex) {
            console.warn("Failed to fetch ", script.src);
            // Ignored for now
        }
    }
}

function scriptEntryToUrl(scriptEntry: ScriptEntry, origin: string): URL | null {
    if (!scriptEntry.src) {
        return null;
    }

    // URL's are finnicky, so let's just kinda bruteforce it
    try {
        return new URL(scriptEntry.src);
    } catch (ex) {
        try {
            return new URL(scriptEntry.src, origin);
        } catch (exx) {
            // Ignored
        }
    }

    return null;
}
