import { css, html, LitElement, unsafeCSS } from 'lit';
import 'playground-elements/playground-code-editor.js';
import gruvboxTheme from 'playground-elements/themes/gruvbox-dark.css.js';

export class DevToolsSourceViewer extends LitElement {
    static get properties() {
        return {
            editor: { type: Object },
            value: { type: String },
            theme: { type: String },
        };
    }

    constructor() {
        super();
        this.value = '';
        this.theme = 'light';
    }

    firstUpdated() {
        this.editor = this.shadowRoot.querySelector('playground-code-editor');
        this.editor.value = this.value;
        console.log(gruvboxTheme);
    }

    render() {
        return html`
            <playground-code-editor
                class="${this.theme === 'light' ? '' : 'playground-theme-gruvbox-dark'}"
                readonly
                line-numbers
                type="js"
            >
            </playground-code-editor>
        `;
    }

    static get styles() {
        return [
            gruvboxTheme,
            css`
                :host {
                    display: block;
                    box-shadow: 1px 1px 0 0;
                    --font-size: 12px;
                    font-size: var(--font-size);
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
