import { css, html, LitElement } from 'lit';
import './views/devtools-action-area.js';
import './views/devtools-elements-list.js';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { DevToolsElementList } from './views/devtools-elements-list.js';
import { postMessage } from "../util/messaging.js";

export class DevToolsPanel extends LitElement {
    static get properties() {
        return {
            verticalView: { type: Boolean },
            selectedElement: { type: Object },
            queryResult: { type: Object },
            loading: { type: Boolean, reflect: true }
        };
    }

    constructor() {
        super();
        this.selectedElement = null;
        this.queryResult = null;
        this.loading = true;

        const mediaQ = window.matchMedia('(max-width: 1000px)');
        mediaQ.addEventListener('change', mediaQresponse => {
            this.verticalView = mediaQresponse.matches;
        });
        this.verticalView = mediaQ.matches;
    }

    firstUpdated() {
        const elementList = /** @type {DevToolsElementList} */ (this.shadowRoot.querySelector('devtools-elements-list'));
        document.addEventListener(MESSAGE_TYPE.QUERY_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            this.loading = false;
            this.queryResult = event.detail;
        });
        document.addEventListener(MESSAGE_TYPE.SELECT_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            if (event.detail.data.node.id === undefined) return;
            this.selectedElement = event.detail.data;
            this.loading = false;
        });
    }

    /**
     * @param {CustomEvent} event
     */
    doSelect(event) {
        /** @type { import('custom-element-tree').CustomElementNodeInMessageFormat } */
        const element = event.detail.chosenElement;
        postMessage({
            type: MESSAGE_TYPE.SELECT,
            id: element.id,
            name: element.tagName,
            tagName: element.tagName, // Can we remove one of these?
        });
    }

    render() {
        return html`
            <devtools-elements-list
                .customElementList=${this.queryResult?.data.elementsArray ?? []}
                .customElementTree=${this.queryResult?.data.elementsTree}
                .selectedElement=${this.selectedElement}
                ?loading=${this.loading}
                @devtools-element-select=${this.doSelect}
            ></devtools-elements-list>
            <devtools-action-area
                    ?loading=${this.loading}
                    .selectedElement=${this.selectedElement}
            ></devtools-action-area>
        `;
    }

    static get styles() {
        return css`
            :host {
                height: 100%;
                max-height: 100%;
                display: flex;
                flex-direction: row;
                --action-area-size: 50%;
                width: 100%;
            }

            devtools-action-area {
                --area-size: var(--action-area-size);
            }
            @media only screen and (max-width: 1000px) {
                :host {
                    flex-direction: column;
                }
            }
        `;
    }
}

if (!customElements.get('devtools-panel')) {
    customElements.define('devtools-panel', DevToolsPanel);
}
