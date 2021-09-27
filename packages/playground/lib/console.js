import { css, html, LitElement } from 'lit';
import 'playground-elements/playground-code-editor.js';
import gruvboxTheme from 'playground-elements/themes/gruvbox-dark.css.js';
import { isConsoleSubmit } from './util';

export class DevToolsConsole extends LitElement {
    static get properties() {
        return {
            editor: { type: Object },
            theme: { type: String },
            value: { type: String },
            commandHistory: { type: Array },
        };
    }

    constructor() {
        super();
        this.editor = null;
        this.theme = 'light';
        this.value = '';
        this.commandHistory = [];
    }

    firstUpdated() {
        this.editor = this.shadowRoot.querySelector('playground-code-editor');
        window.requestAnimationFrame(() => {
            this.focusEditor();
        });
    }

    focusEditor() {
        // Quite hacky, maybe there's a better way?
        this.editor.shadowRoot.querySelector('.CodeMirror-code').focus();
    }

    /**
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
        if (isConsoleSubmit(e)) {
            const consoleContent = this.editor.value;
            const submitEvent = new CustomEvent('devtools-console-submit', { detail: { code: consoleContent } });
            const eventSuccess = this.dispatchEvent(submitEvent);
            if (eventSuccess) {
                this.editor.value = '';
            }
        }
    }

    render() {
        return html`
            ${caret}
            <playground-code-editor
                class="${this.theme === 'light' ? '' : 'playground-theme-gruvbox-dark'}"
                type="js"
                value="console.log('foo');"
                @keydown=${this.onKeyDown}
            >
            </playground-code-editor>
        `;
    }

    static get styles() {
        return [
            gruvboxTheme,
            css`
                :host {
                    display: flex;
                    --font-size: 12px;
                    font-size: var(--font-size);
                    position: relative;
                    width: 100%;
                }

                svg {
                    width: calc(var(--font-size) * 0.7);
                    height: calc(var(--font-size) * 0.7);
                    margin-top: calc(var(--font-size) * 0.6);
                    margin-left: 0.25rem;
                    fill: #367cf1;
                    transform: rotate(-90deg);
                    transform-origin: center;
                }

                playground-code-editor {
                    height: fit-content;
                    width: 100%;
                    --playground-code-font-size: var(--font-size);
                }
            `,
        ];
    }
}

if (!customElements.get('devtools-console')) {
    customElements.define('devtools-console', DevToolsConsole);
}

const caret = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 451.847 451.847">
    <path
        d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751   c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0   c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
    />
</svg>`;
