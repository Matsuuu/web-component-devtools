export type PolyfillsLoaderConfig = import("./types").PolyfillsLoaderConfig;
export type File = import("./types").File;
export type GeneratedFile = import("./types").GeneratedFile;
export type PolyfillFile = import("./types").PolyfillFile;
export type PolyfillsConfig = import("./types").PolyfillsConfig;
export type PolyfillConfig = import("./types").PolyfillConfig;
export type PolyfillsLoader = import("./types").PolyfillsLoader;
export type LegacyEntrypoint = import("./types").LegacyEntrypoint;
/**
 * Creates a loader script that executes immediately, loading the configured
 * polyfills and resources (app entrypoints, scripts etc.).
 *
 * @param {PolyfillsLoaderConfig} cfg
 * @returns {PolyfillsLoader | null}
 */
export function createPolyfillsLoader(cfg: PolyfillsLoaderConfig): PolyfillsLoader | null;
export const DEFAULT_POLYFILLS_DIR: "polyfills";
//# sourceMappingURL=create-polyfills-loader.d.ts.map