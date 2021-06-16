export class SpotlightBorder extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement("template");
        template.innerHTML = `
      <style>
        :host {
          --position-x: 0px;
          --position-y: 0px;
          --size-x: 0px;
          --size-y: 0px;

          --info-box-offset: -2.5rem;

          position: absolute;
          top: var(--position-y);
          left: var(--position-x);
          height: var(--size-y);
          width: var(--size-x);
          z-index: 9001;
          pointer-events: none;
          transition: 200ms ease-in-out;
        }

        .element-highlight {
          background: #a0c5e8;
          opacity: 0.6;
          height: 100%;
          width: 100%;
          position: relative;
        }

        .info-box {
            width: fit-content;
            height: fit-content;
            background: #2a4747;
            color: #FFF;
            position: absolute;
            bottom: var(--info-box-offset);
            left: 0;
            white-space: nowrap;
            padding: 0.3rem 0.6rem;
        }

        .info-box p {
            margin: 0;
            font-size: 1.1rem;
        }

        .info-box span {
            color: hotpink;
        }
      </style>

      <div class="element-highlight">
      </div>
          <div class="info-box"><p class="info-box-text"></p></div>
    `;

        this.position = { x: 0, y: 0 };
        this.size = { x: 0, y: 0 };

        const root = this.attachShadow({ mode: "open" });
        root.appendChild(template.content.cloneNode(true));
    }

    /**
     * @param {string} name
     * @param {{ x: number; y: number; }} position
     * @param {{ x: number; y: number; }} size
     */
    updateSpotlight(name, position, size) {
        const isAboveViewport = position.y < 0;
        const isBelowViewport = position.y > window.visualViewport.height;
        if (!isAboveViewport && !isBelowViewport) {
            this.style.setProperty("--position-x", position.x + "px");
            this.style.setProperty("--position-y", position.y + "px");
            this.style.setProperty("--size-x", size.x + "px");
            this.style.setProperty("--size-y", size.y + "px");
            this.style.setProperty("--info-box-offset", "-2.5rem");
        } else {
            this.style.setProperty("--size-y", "0px");
            this.style.setProperty("--position-x", position.x + "px");
            if (isAboveViewport) {
                this.style.setProperty("--position-y", "0px");
            }
            if (isBelowViewport) {
                this.style.setProperty("--position-y", window.visualViewport.height + "px");
                this.style.setProperty("--info-box-offset", "0.25rem");
            }
        }

        this.updateInfoBox(name, position, size);
    }

    /**
     * @param {string} name
     * @param {{ x: number; y: number; }} position
     * @param {{ x: any; y: any; }} size
     */
    updateInfoBox(name, position, size) {
        this.shadowRoot.querySelector(
            ".info-box-text"
        ).innerHTML = `<span>${name}</span>  |  ${size.x.toFixed(1)}px x ${size.y.toFixed(1)}px`;

    }

    static init() {
        if (!customElements.get("wc-devtools-spotlight-border")) {
            customElements.define("wc-devtools-spotlight-border", SpotlightBorder);
        }
    }
}
