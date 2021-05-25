export type DocumentAst = object | import("parse5").DefaultTreeDocument;
export type PolyfillsLoaderConfig = import("./types").PolyfillsLoaderConfig;
export type PolyfillsLoader = import("./types").PolyfillsLoader;
export type GeneratedFile = import("./types").GeneratedFile;
/**
 * Transforms an index.html file, injecting a polyfills loader for
 * compatibility with older browsers.
 *
 * @param {string} htmlString
 * @param {PolyfillsLoaderConfig} cfg
 * @returns {{ htmlString: string, polyfillFiles: GeneratedFile[] }}
 */
export function injectPolyfillsLoader(htmlString: string, cfg: PolyfillsLoaderConfig): {
    htmlString: string;
    polyfillFiles: GeneratedFile[];
};
//# sourceMappingURL=inject-polyfills-loader.d.ts.map