import { css, html, LitElement } from 'lit';
import './views/devtools-action-area.js';
import './views/devtools-elements-list.js';
import './views/devtools-divider.js';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { DevToolsElementList } from './views/devtools-elements-list.js';
import { postMessage } from "../util/messaging.js";

export class DevToolsPanel extends LitElement {
    static get properties() {
        return {
            verticalView: { type: Boolean },
            selectedElement: { type: Object },
            queryResult: { type: Object },
        };
    }

    constructor() {
        super();
        this.selectedElement = null;
        this.queryResult = null;

        const mediaQ = window.matchMedia('(max-width: 1000px)');
        mediaQ.addEventListener('change', mediaQresponse => {
            this.verticalView = mediaQresponse.matches;
        });
        this.verticalView = mediaQ.matches;
    }

    firstUpdated() {
        const elementList = /** @type {DevToolsElementList} */ (this.shadowRoot.querySelector('devtools-elements-list'));
        document.addEventListener(MESSAGE_TYPE.QUERY_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            this.queryResult = event.detail;
            if (this.queryResult.reselectTarget) {
                elementList.doReSelect(this.queryResult.reselectTarget);
            }
        });
        document.addEventListener(MESSAGE_TYPE.SELECT_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            console.log(event.detail);
            this.selectedElement = event.detail.data;
        });
    }

    /**
     * @param {CustomEvent} event
     */
    doSelect(event) {
        const element = event.detail.elem;
        postMessage({
            type: MESSAGE_TYPE.SELECT,
            indexInDevTools: element.index,
            name: element.name,
            tagName: element.name,
        });
    }

    onResize(e) {
        if (this.verticalView) {
            const newFlexPercentage = (100 - (e.detail.y / window.innerHeight) * 100).toFixed(0);
            this.style.setProperty('--action-area-size', newFlexPercentage + '%');
        } else {
            const newFlexPercentage = (100 - (e.detail.x / window.innerWidth) * 100).toFixed(0);
            this.style.setProperty('--action-area-size', newFlexPercentage + '%');
        }
    }

    render() {
        return html`
            <devtools-elements-list
                .customElementList=${this.queryResult?.data.elementsArray ?? []}
                .customElementMap=${this.queryResult?.data.elementsMap ?? {}}
                .selectedElement=${this.selectedElement}
                @devtools-element-select=${this.doSelect}
            ></devtools-elements-list>
            <devtools-divider @devtools-resize=${this.onResize}></devtools-divider>
            <devtools-action-area
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
