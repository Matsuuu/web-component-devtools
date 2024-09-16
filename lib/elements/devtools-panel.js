import { css, html, LitElement } from "lit";
import "./views/devtools-action-area.js";
import "./views/devtools-elements-list.js";
import { QueryMessage, QueryResultMessage, SelectMessage, SelectResultMessage } from "../types/message-types.js";
import { CONNECTION_HOSTS, sendMessage } from "../messaging/messaging.js";

export class DevToolsPanel extends LitElement {
    static get properties() {
        return {
            verticalView: { type: Boolean },
            selectedElement: { type: Object },
            queryResult: { type: Object },
            loading: { type: Boolean, reflect: true },
        };
    }

    constructor() {
        super();
        this.selectedElement = null;
        this.queryResult = null;
        this.loading = true;

        const mediaQ = window.matchMedia("(max-width: 1000px)");
        mediaQ.addEventListener("change", mediaQresponse => {
            this.verticalView = mediaQresponse.matches;
        });
        this.verticalView = mediaQ.matches;
    }

    firstUpdated() {
        document.addEventListener(new QueryResultMessage().type, (/** @type {CustomEvent} */ event) => {
            console.log("ON QUERY RESULT");
            this.loading = false;
            this.queryResult = event.detail;
        });
        document.addEventListener(SelectResultMessage.type, (/** @type {CustomEvent} */ event) => {
            if (event.detail?.node?.id === undefined) return;
            this.selectedElement = event.detail;
            this.loading = false;
        });
    }

    /**
     * @param {CustomEvent} event
     */
    doSelect(event) {
        // TODO: We want to have some kind of small loading indicator but can't use the loading
        // TODO:  we have since we have that for the initial loading
        /** @type { import('custom-element-tree').CustomElementNodeInMessageFormat } */
        const element = event.detail.chosenElement;
        sendMessage(CONNECTION_HOSTS.CONTENT, new SelectMessage({ node: element }));
    }

    render() {
        return html`
            <devtools-elements-list
                .customElementTree=${this.queryResult?.queryData.elementsTree}
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

if (!customElements.get("devtools-panel")) {
    customElements.define("devtools-panel", DevToolsPanel);
}
