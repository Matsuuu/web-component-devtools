import { css, html, LitElement } from "lit";
import "./devtools-rightclick-menu-option.js";

export class DevToolsRightClickMenu extends LitElement {

    static get properties() {
        return {
            target: { type: Object }
        };
    }

    constructor() {
        super();
        this.target = null;
    }

    scrollIntoView() {
        this.target.scrollToElement();
        this.remove();
    }

    render() {
        return html`
            <devtools-right-click-menu-option label="Scroll into view" @click=${this.scrollIntoView}></devtools-right-click-menu-option>
        `;
    }

    static get styles() {
        return css`
        :host {
            display: flex;
            border-radius: 4px;
            background: #FFF;
            box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            position: absolute;
            top: var(--top-offset, 0);
            left: var(--left-offset, 0);
            opacity: 1;

            animation: fade-in 500ms;
        }

        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    }
}

if (!customElements.get("devtools-right-click-menu")) {
    customElements.define("devtools-right-click-menu", DevToolsRightClickMenu);
}
