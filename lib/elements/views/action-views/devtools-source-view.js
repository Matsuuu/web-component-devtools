import { css, html, LitElement } from 'lit';
import 'playground';
import { isDarkMode } from '../../../util/devtools-state';

export class DevToolsSourceView extends LitElement {
    static get properties() {
        return {
            selectedElement: { type: Object },
        };
    }

    constructor() {
        super();
        this.selectedElement = {};
    }

    render() {
        return html`<devtools-source-viewer
            theme=${isDarkMode() ? 'dark' : 'light'}
            .value=${this.selectedElement.declaration}
        ></devtools-source-viewer>`;
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

if (!customElements.get('devtools-source-view')) {
    customElements.define('devtools-source-view', DevToolsSourceView);
}
