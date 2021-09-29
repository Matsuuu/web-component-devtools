import { css, html, LitElement } from 'lit';
import 'playground';
import { DevToolsConsole } from '../../../../packages/playground/lib/console';
import { MESSAGE_TYPE } from '../../../types/message-types';
import { isDarkMode } from '../../../util/devtools-state';
import { postMessage } from '../../../util/messaging';

export class DevToolsConsoleView extends LitElement {
    static get properties() {
        return {
            selectedElement: { type: Object }
        };
    }

    constructor() {
        super();
        this.selectedElement = {};
        this.editor = null;
    }

    firstUpdated() {
        this.editor = /** @type DevToolsConsole */ (this.shadowRoot.querySelector('devtools-console'));
        this.addEventListener('click', this.focusEditor.bind(this));
        document.addEventListener(MESSAGE_TYPE.CONSOLE_ACTION_RESULT.toString(), this.onConsoleActionResult.bind(this));
    }

    focusEditor() {
        this.editor?.focusEditor();
    }

    /**
     * @param {CustomEvent} e
     */
    onSubmit(e) {
        postMessage({
            type: MESSAGE_TYPE.CONSOLE_ACTION,
            code: e.detail.code,
        });
        this.scrollTo(0, this.scrollHeight);
    }

    onConsoleActionResult(e) {
        const eventData = e.detail.eventData;
        this.editor.addHistoryEntry(eventData);
    }

    render() {
        return html`<devtools-console
            theme=${isDarkMode() ? 'dark' : 'light'}
            @devtools-console-submit=${this.onSubmit}
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
