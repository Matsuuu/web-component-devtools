import { resolve } from 'path';
import { mergeConfig, defineConfig } from 'vite';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import baseConfig, { baseManifest, baseBuildOptions } from './vite.config.base'

const outDir = resolve(__dirname, 'dist_firefox');

export default mergeConfig(
  baseConfig,
  defineConfig({
    base: './',
    plugins: [
      crx({
        manifest: {
          ...baseManifest,
          background: {
            scripts: [ 'src/pages/background/index.ts' ]
          },
        } as ManifestV3Export,
        browser: 'firefox',
        contentScripts: {
          injectCss: true,
        }
      })
    ],
    build: {
      ...baseBuildOptions,
      outDir,
      rollupOptions: {
        input: {
          devtoolsPanel: resolve(__dirname, 'src/pages/devtools/panel.html')
        }
      }
    },
    publicDir: resolve(__dirname, 'public'),
  })
)
