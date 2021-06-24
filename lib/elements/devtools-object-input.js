import { css, html, LitElement } from 'lit';

export class DevtoolsObjectInput extends LitElement {
    static get properties() {
        return {
            object: { type: Object },
            property: { type: Object },
            propName: { type: String }
        };
    }

    constructor() {
        super();
        this.object = {};
        this.property = {};
        this.propName = "";
    }

    firstUpdated() {
        console.log(this.object);
        console.log(this.property);
        console.log(this.propName);
    }

    render() {
        return html`
            <details>
                <summary>
                    <span> <label>${this.object}:</label> </span>
                </summary>
            </details>
        `;
    }

    static get styles() {
        return css`
            :host {
                --font-size: 0.8rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            summary {
                margin-left: -0.85rem;
                width: 100%;
            }

            summary > span {
                display: inline;
                width: 100%;
            }

            details {
                display: flex;
                width: 100%;
            }

            details[open] {
                padding-bottom: 1rem;
            }

            .param-function-caller {
                margin: 0 0 0 1rem;
            }

            label {
                font-size: 0.8rem;
                padding: 3px 1rem 3px 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;
            }

            .param-list {
                display: flex;
                flex-direction: column;
                padding: 0 0 0 1rem;
            }
        `;
    }
}

if (!customElements.get('devtools-object-input')) {
    customElements.define('devtools-object-input', DevtoolsObjectInput);
}
