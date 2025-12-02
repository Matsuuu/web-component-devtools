/** @type { import("@custom-elements-manifest/analyzer").Config} */
export default {
    /** Globs to analyze */
    globs: ["src/**/*.js", "src/**/*.ts"],
    /** Globs to exclude */
    // exclude: ["src/foo.js"],
    /** Directory to output CEM to */
    outdir: ".",
    /** Run in dev mode, provides extra logging */
    dev: false,
    /** Run in watch mode, runs on file changes */
    watch: false,
    /** Include third party custom elements manifests */
    dependencies: true,
    /** Output CEM path to `package.json`, defaults to true */
    packagejson: true,
    /** Enable special handling for litelement */
    litelement: true,
    /** Enable special handling for catalyst */
    catalyst: false,
    /** Enable special handling for fast */
    fast: false,
    /** Enable special handling for stencil */
    stencil: false,
    /** Provide custom plugins */
    // plugins: [myAwesomePlugin()],

    /**
     * Resolution options when using `dependencies: true`
     * For detailed information about each option, please refer to the [oxc-resolver documentation](https://github.com/oxc-project/oxc-resolver?tab=readme-ov-file#options).
     */
    resolutionOptions: {
        extensions: [".js", ".ts"],
        mainFields: ["module", "main"],
        conditionNames: ["import", "require"],
    },
};
