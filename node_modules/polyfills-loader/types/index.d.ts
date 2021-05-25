export type PolyfillsLoaderConfig = import("./src/types").PolyfillsLoaderConfig;
export type PolyfillsConfig = import("./src/types").PolyfillsConfig;
export type PolyfillConfig = import("./src/types").PolyfillConfig;
export type ModernEntrypoint = import("./src/types").ModernEntrypoint;
export type LegacyEntrypoint = import("./src/types").LegacyEntrypoint;
export type FileType = "script" | "module" | "es-module-shims" | "systemjs";
export type File = import("./src/types").File;
export type GeneratedFile = import("./src/types").GeneratedFile;
export type PolyfillFile = import("./src/types").PolyfillFile;
export type PolyfillsLoader = import("./src/types").PolyfillsLoader;
export const injectPolyfillsLoader: (htmlString: string, cfg: import("./src/types").PolyfillsLoaderConfig) => {
    htmlString: string;
    polyfillFiles: import("./src/types").GeneratedFile[];
};
export const createPolyfillsLoader: (cfg: import("./src/types").PolyfillsLoaderConfig) => import("./src/types").PolyfillsLoader;
export const createPolyfillsData: (cfg: import("./src/types").PolyfillsLoaderConfig) => import("./src/types").PolyfillFile[];
export const noModuleSupportTest: string;
export const fileTypes: Record<"SCRIPT" | "MODULE" | "ES_MODULE_SHIMS" | "SYSTEMJS", import("./src/types").FileType>;
export const createContentHash: (content: string) => string;
export const cleanImportPath: (importPath: string) => string;
export const getScriptFileType: (script: import("parse5").Node) => import("./src/types").FileType;
export const hasFileOfType: (cfg: import("./src/types").PolyfillsLoaderConfig, type: import("./src/types").FileType) => boolean;
//# sourceMappingURL=index.d.ts.map