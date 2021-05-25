import resolve from '@rollup/plugin-node-resolve';
import html from '@open-wc/rollup-plugin-html';
import copy from 'rollup-plugin-copy';

export default [{
    input: 'html/lit-devtools-chrome.html',
    output: { dir: 'dist' },
    plugins: [
        html({
            minify: false,
        }),
        copy({
        }),
        resolve(),
    ],
}, {
    input: './lib/content/content_script.js',
    output: { dir: 'dist' },
    plugins: [
        resolve()
    ]
}, {
    input: './lib/background/background.js',
    output: { dir: 'dist' },
    plugins: [
        resolve()
    ]
}
];
