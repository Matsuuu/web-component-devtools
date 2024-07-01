import resolve from '@rollup/plugin-node-resolve';
import html from '@open-wc/rollup-plugin-html';
import copy from 'rollup-plugin-copy';

const DEV_MODE = process.env.NODE_ENV === "DEV";
console.log("DEV MODE : ", DEV_MODE)

const DEV_MODE_INPUTS = [
    {
        external: ["analyzer"],
        input: {
            'content_script': './lib/content/content_script.js',
            'nydus': './packages/nydus/nydus.js',
            'custom-element-tree': './packages/element-tree/lib/custom-element-tree.js',
            'background': './lib/background/background.js',
            'background-worker': './lib/background/background-worker.js',
            'spotlight-border': './lib/crawler/spotlight-border.js',
            'content-messaging': './lib/content/content-messaging.js',
            'connection-channels': './lib/types/connection-channels.js',
            'message-types': './lib/types/message-types.js',
            'messaging': './lib/messaging/messaging.js',
            'block-list': './lib/util/block-list.js'
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
    }
];

const PROD_INPUTS = [
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
        input: {
            analyzer: './packages/analyzer/index.js',
        },
        output: { dir: 'dist' },
        plugins: [
            resolve(),
        ],
    }
];

export default [
    ...DEV_MODE_INPUTS,
    ...(DEV_MODE ? [] : PROD_INPUTS)
];
