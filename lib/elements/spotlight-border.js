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

          position: absolute;
          top: var(--position-y);
          left: var(--position-x);
          height: var(--size-y);
          width: var(--size-x);
          z-index: 9001;
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
            background: #2a4747;
            color: #FFF;
            position: sticky;
            bottom: 1rem;
            right: 0;
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
        this.style.setProperty("--position-x", position.x + "px");
        this.style.setProperty("--position-y", position.y + "px");
        this.style.setProperty("--size-x", size.x + "px");
        this.style.setProperty("--size-y", size.y + "px");
        this.shadowRoot.querySelector(
            ".info-box-text"
        ).innerHTML = `<span>${name}</span>  |  ${size.x.toFixed(1)}px x ${size.y.toFixed(1)}px`;
    }

    static init() {
        if (!customElements.get("spotlight-border")) {
            customElements.define("spotlight-border", SpotlightBorder);
        }
    }
}
