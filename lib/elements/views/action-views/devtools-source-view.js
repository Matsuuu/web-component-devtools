import { css, html, LitElement } from 'lit';
import 'playground';

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

    firstUpdated() {
        console.log(this.selectedElement);
    }

    render() {
        return html`<devtools-source-viewer .value=${this.selectedElement.declaration}></devtools-source-viewer>`;
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
