import resolve from '@rollup/plugin-node-resolve';
import html from '@open-wc/rollup-plugin-html';
import copy from 'rollup-plugin-copy';

export default [
    {
        external: ["analyzer", "nydus"],
        input: 'html/*.html',
        output: {
            dir: 'dist',
            paths: {
                analyzer: './analyzer.js',
                nydus: "./nydus.js"
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
            content_script: './lib/content/content_script.js',
            nydus: './packages/nydus/nydus.js',
            background: './lib/background/background.js',
            "crawler-constants": './lib/crawler/crawler-constants.js',
            'crawler-inject': './lib/crawler/crawler-inject.js',
            'spotlight-border': './lib/crawler/spotlight-border.js',
            'content-messaging': './lib/content/content-messaging.js',
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
            analyzer: './packages/analyzer/index.js',
        },
        output: { dir: 'dist' },
        plugins: [
            resolve(),
        ],
    }
];
