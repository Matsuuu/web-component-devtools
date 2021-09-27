import { css, html, LitElement } from 'lit';
import 'playground';
import { DevToolsConsole } from '../../../../packages/playground/lib/console';

export class DevToolsConsoleView extends LitElement {
    static get properties() {
        return {
            selectedElement: { type: Object },
            theme: { type: Boolean },
        };
    }

    constructor() {
        super();
        this.selectedElement = {};
        this.theme = 'light';
    }

    firstUpdated() {
        this.addEventListener('click', this.focusEditor.bind(this));
    }

    focusEditor() {
        /** @type DevToolsConsole */ (this.shadowRoot.querySelector('devtools-console'))?.focusEditor();
    }

    render() {
        return html`<devtools-console
            theme=${this.theme}
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
