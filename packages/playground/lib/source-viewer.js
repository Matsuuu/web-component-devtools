import { css, html, LitElement } from 'lit';
import 'playground-elements/playground-code-editor.js';
import gruvboxTheme from 'playground-elements/themes/gruvbox-dark.css.js';
import 'js-beautify/js/lib/beautify.js';

export class DevToolsSourceViewer extends LitElement {
    static get properties() {
        return {
            editor: { type: Object },
            value: { type: String },
            theme: { type: String },
            fontsize: { type: Number },
        };
    }

    constructor() {
        super();
        this.value = '';
        this.theme = 'light';
        this.fontsize = 12;
        this.editor = null;
    }

    /**
     * @param {import('lit').PropertyValues} _changedProperties
     */
    updated(_changedProperties) {
        this.editor = this.shadowRoot.querySelector('playground-code-editor');
        if (_changedProperties.has('fontsize')) {
            this.style.setProperty('--font-size', this.fontsize + 'px');
        }
        if (_changedProperties.has('value')) {
            this.editor.value = this.value;
        }
    }

    fontSizeUp() {
        this.fontsize += 1;
    }

    fontSizeDown() {
        this.fontsize -= 1;
    }

    renderSizeOptions() {
        return html`<div class="size-options">
            <button @click=${this.fontSizeDown}>-</button>
            <button @click=${this.fontSizeUp}>+</button>
        </div>`;
    }

    format() {
        // Imported as a global
        // @ts-ignore
        this.value = js_beautify(this.value);
    }

    render() {
        return html`
            ${this.renderSizeOptions()}
            <playground-code-editor
                class="${this.theme === 'light' ? '' : 'playground-theme-gruvbox-dark'}"
                readonly
                line-numbers
                type="js"
            >
            </playground-code-editor>
            <button @click=${() => this.format()}>Format</button>
        `;
    }

    static get styles() {
        return [
            gruvboxTheme,
            css`
                :host {
                    display: block;
                    --font-size: 12px;
                    font-size: var(--font-size);
                    position: relative;
                    width: 100%;
                }

                .size-options {
                    visibility: hidden;
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    z-index: 100;
                }

                :host(:hover) .size-options {
                    visibility: visible;
                }

                playground-code-editor {
                    --playground-code-font-size: var(--font-size);
                }
            `,
        ];
    }
}

if (!customElements.get('devtools-source-viewer')) {
    customElements.define('devtools-source-viewer', DevToolsSourceViewer);
}
