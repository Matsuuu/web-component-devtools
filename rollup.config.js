import resolve from '@rollup/plugin-node-resolve';
import html from '@open-wc/rollup-plugin-html';
import copy from 'rollup-plugin-copy';

export default [
    {
        external: ["analyzer", "nydus", "custom-element-tree"],
        input: 'html/*.html',
        output: {
            dir: 'dist',
            paths: {
                analyzer: './analyzer.js',
                nydus: "./nydus.js",
                "custom-element-tree": "./custom-element-tree.js"
            }
        },
        plugins: [
            html({
                minify: false,
            }),
            copy({
                targets: [
                    { src: 'icons/*', dest: 'dist' },
                    { src: 'manifest.json', dest: 'dist' },
                ],
            }),
            resolve()
        ],
    },
    {
        external: ["analyzer"],
        input: {
            'content_script': './lib/content/content_script.js',
            'nydus': './packages/nydus/nydus.js',
            'custom-element-tree': './packages/element-tree/lib/custom-element-tree.js',
            'background': './lib/background/background.js',
            'background-worker': './lib/background/background-worker.js',
            //"crawler-constants": './lib/crawler/crawler-constants.js',
            'spotlight-border': './lib/crawler/spotlight-border.js',
            'content-messaging': './lib/content/content-messaging.js',
            'connection-channels': './lib/types/connection-channels.js',
            'message-types': './lib/types/message-types.js'
        },
        output: {
            dir: 'dist',
            paths: {
                analyzer: './analyzer.js'
            }
        },
        plugins: [
            resolve(),
        ],
    },
    {
        input: {
            'crawler-inject': './lib/crawler/crawler-inject.js',
        },
        output: { dir: 'dist' },
        plugins: [
            resolve(),
        ],
    },
    {
        input: {
            analyzer: './packages/analyzer/index.js',
        },
        output: { dir: 'dist' },
        plugins: [
            resolve(),
        ],
    }
];
