import { css, html, LitElement } from "lit";

class SpotlightBorder extends LitElement {
    static get properties() {
        return {
            position: { type: Object },
            size: { type: Object },
        };
    }

    /**
     * @param {{ x: number; y: number; }} position
     * @param {{ x: number; y: number; }} size
     */
    updateSpotlight(position, size) {
        this.style.setProperty("--position-x", position.x + "px");
        this.style.setProperty("--position-y", position.y + "px");
        this.style.setProperty("--size-x", size.x + "px");
        this.style.setProperty("--size-x", size.y + "px");
    }

    render() {
        return html`
            <div class="element-highlight"></div>
        `;
    }

    static get styles() {
        return css`

            :host {
                --position-x: 0px;
                --position-y: 0px;
                --size-x: 0px;
                --size-y: 0px;

                position: absolute;
                top: var(--position-y);
                left: var(--position-x);
                height: var(--size-y);
                width: var(--size-x);
            }

            .element-highlight {
                background: lightgreen;
            }
    `;
    }
}

if (!customElements.get("spotlight-border")) {
    customElements.define("spotlight-border", SpotlightBorder);
}
