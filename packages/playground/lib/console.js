import { css, html, LitElement } from 'lit';
import 'playground-elements/playground-code-editor.js';
import { isConsoleSubmit } from './util';

export class DevToolsConsole extends LitElement {
    static get properties() {
        return {
            editor: { type: Object },
        };
    }

    firstUpdated() {
        this.editor = this.shadowRoot.querySelector('playground-code-editor');
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
            <playground-code-editor type="js" value="console.log('foo');" @keydown=${this.onKeyDown}>
            </playground-code-editor>
        `;
    }

    static get styles() {
        return css`
            :host {
                display: block;
                box-shadow: 1px 1px 0 0;
            }
        `;
    }
}

if (!customElements.get('devtools-console')) {
    customElements.define('devtools-console', DevToolsConsole);
}
