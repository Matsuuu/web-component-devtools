import { css, html, LitElement } from 'lit';
import "./devtools-inspector.js";

export class DevToolsActionArea extends LitElement {
    render() {
        return html`<devtools-inspector></devtools-inspector>`;
    }

    static get styles() {
        return css`

            :host {
                --area-size: 40%;
                flex-basis: var(--area-size);
                display: flex;

                height: 100%;
                max-height: 100%;
                overflow-y: auto;
                box-sizing: border-box;
            }

            @media only screen and (max-width: 1000px) {
                :host {
                    --area-size: 60%;
                    flex-direction: column;
                    flex-basis: var(--area-size);
                }
            }
        `
    }
}

if (!customElements.get("devtools-action-area")) {
    customElements.define("devtools-action-area", DevToolsActionArea);
}
