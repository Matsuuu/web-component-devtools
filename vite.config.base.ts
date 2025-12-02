import { resolve } from "path";
import { ManifestV3Export } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, BuildOptions, build } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { stripDevIcons, crxI18n } from "./custom-vite-plugins";
import manifest from "./manifest.json";
import devManifest from "./manifest.dev.json";
import pkg from "./package.json";

const isDev = process.env.__DEV__ === "true";
// set this flag to true, if you want localization support
const localize = false;

export const baseManifest = {
    ...manifest,
    version: pkg.version,
    ...(isDev ? devManifest : ({} as ManifestV3Export)),
    ...(localize
        ? {
              name: "__MSG_extName__",
              description: "__MSG_extDescription__",
              default_locale: "en",
          }
        : {}),
} as ManifestV3Export;

export const baseBuildOptions: BuildOptions = {
    sourcemap: isDev,
    emptyOutDir: !isDev,
};

export default defineConfig({
    plugins: [
        //
        tailwindcss(),
        tsconfigPaths(),
        stripDevIcons(isDev),
        crxI18n({ localize, src: "./src/locales" }),
    ],
    publicDir: resolve(__dirname, "public"),
    build: {
        minify: false,
        rollupOptions: {
            input: {
                devtoolsPanel: resolve(__dirname, "src/pages/devtools/panel.html"),
            },
        },
        // rollupOptions: {
        //     external: ["/ts.bundle.js"],
        // },
    },
});

export function bundleInPageScriptPlugin(outDir: string) {
    return {
        name: "bundle-inpage-as-single-file",
        async closeBundle() {
            // Build the InPage IIFE
            await build({
                configFile: false,
                build: {
                    outDir,
                    emptyOutDir: false, // don’t wipe CRX build
                    lib: {
                        entry: "src/pages/inpage/inpage-index.ts",
                        name: "Inpage",
                        fileName: "inpage",
                        formats: ["iife"],
                    },
                    rollupOptions: {
                        output: {
                            inlineDynamicImports: true,
                            entryFileNames: "inpage.js",
                        },
                    },
                },
            });
        },
    };
}
