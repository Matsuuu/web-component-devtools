import { css, html, LitElement } from 'lit';
import './views/custom-elements-inspector.js';
import './views/custom-elements-list.js';

export class DevToolsPanel extends LitElement {
    render() {
        return html`
            <custom-elements-list></custom-elements-list>
            <custom-elements-inspector></custom-elements-inspector>
        `;
    }

    static get styles() {
        return css`
            :host {
                height: 100%;
                max-height: 100%;
                display: flex;
                flex-direction: column;
            }
        `;
    }
}

if (!customElements.get('devtools-panel')) {
    customElements.define('devtools-panel', DevToolsPanel);
}
