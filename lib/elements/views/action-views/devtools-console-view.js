import { css, html, LitElement } from 'lit';
import 'playground';
import { CONNECTION_HOSTS, sendMessage } from '../../../messaging/messaging';
import { ConsoleActionMessage, ConsoleActionResultMessage } from '../../../types/message-types';
import { isDarkMode } from '../../../util/devtools-state';

export class DevToolsConsoleView extends LitElement {
    static get properties() {
        return {
            selectedElement: { type: Object },
        };
    }

    constructor() {
        super();
        this.selectedElement = {};
        this.editor = null;
    }

    firstUpdated() {
        this.addEventListener('click', this.focusEditor.bind(this));
        document.addEventListener(new ConsoleActionResultMessage().type, this.onConsoleActionResult.bind(this));
    }

    updated() {
        this.editor = /** @type {DevToolsConsole} */ (this.shadowRoot.querySelector('devtools-console'));
    }

    focusEditor() {
        this.editor?.focusEditor();
    }

    /**
     * @param {CustomEvent} e
     */
    onSubmit(e) {
        sendMessage(CONNECTION_HOSTS.CONTENT, new ConsoleActionMessage({ code: e.detail.code }));
        this.scrollTo(0, this.scrollHeight);
    }

    onConsoleActionResult(e) {
        const eventData = e.detail.eventData;
        this.editor.addHistoryEntry(eventData);
    }

    render() {
        if (!this.selectedElement) return html``;

        return html`<devtools-console
            theme=${isDarkMode() ? 'dark' : 'light'}
            @devtools-console-submit=${this.onSubmit}
            .value=${this.selectedElement.declaration}
        ></devtools-console>`;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-basis: 100%;
                height: 100%;
                max-height: 100%;
                overflow-y: auto;
            }

            devtools-source-viewer {
                --font-size: 12px;
            }
        `;
    }
}

if (!customElements.get('devtools-console-view')) {
    customElements.define('devtools-console-view', DevToolsConsoleView);
}
