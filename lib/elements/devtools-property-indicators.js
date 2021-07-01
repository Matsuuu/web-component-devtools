import { css, html, LitElement } from 'lit';
import './devtools-property-indicator.js';

export class DevtoolsPropertyIndicators extends LitElement {
    static get properties() {
        return {
            property: { type: Object },
        };
    }

    constructor() {
        super();
        /** @type {import("custom-elements-manifest/schema").ClassMember } */
        this.property = null;
    }

    handlePrivacy() {
        if (this.property?.privacy !== 'private') return '';
        return html`<devtools-property-indicator
            dir="left"
            type="privacy"
            hovertext="Private"
        ></devtools-property-indicator>`;
    }

    handleStatic() {
        if (!this.property?.static) return '';
        return html`<devtools-property-indicator
            dir="left"
            type="static"
            hovertext="Static"
        ></devtools-property-indicator>`;
    }

    handleInheritance() {
        if (!this.property?.inheritedFrom) return '';
        return html`<devtools-property-indicator
            dir="left"
            type="inheritance"
            hovertext="Inherited from ${this.property.inheritedFrom.name}"
        ></devtools-property-indicator>`;
    }

    render() {
        return html` ${this.handlePrivacy()} ${this.handleStatic()} ${this.handleInheritance()} `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                float: right;
                margin-left: auto;
            }

            devtools-property-indicator {
                margin: 0 0.25rem;
            }
        `;
    }
}

if (!customElements.get('devtools-property-indicators')) {
    customElements.define('devtools-property-indicators', DevtoolsPropertyIndicators);
}
