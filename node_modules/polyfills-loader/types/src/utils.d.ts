export type Document = object | import("parse5").DefaultTreeDocument;
export type Node = object | import("parse5").DefaultTreeNode;
export type FileType = "script" | "module" | "es-module-shims" | "systemjs";
export type PolyfillsLoaderConfig = import("./types").PolyfillsLoaderConfig;
export const noModuleSupportTest: "!('noModule' in HTMLScriptElement.prototype)";
/** @type {Record<'SCRIPT' | 'MODULE' | 'ES_MODULE_SHIMS' | 'SYSTEMJS', FileType>} */
export const fileTypes: Record<'SCRIPT' | 'MODULE' | 'ES_MODULE_SHIMS' | 'SYSTEMJS', FileType>;
/**
 * @param {string} content
 * @returns {string}
 */
export function createContentHash(content: string): string;
/**
 * @param {string} importPath
 * @returns {string}
 */
export function cleanImportPath(importPath: string): string;
/**
 * @param {Node} script
 * @returns {FileType}
 */
export function getScriptFileType(script: Node): FileType;
/**
 * @param {PolyfillsLoaderConfig} cfg
 * @param {FileType} type
 */
export function hasFileOfType(cfg: PolyfillsLoaderConfig, type: FileType): boolean;
//# sourceMappingURL=utils.d.ts.map