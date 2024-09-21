import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { log } from "../../util/messaging";
import { HighlightMessage, RefreshMessage, ScrollIntoViewMessage } from "../../types/message-types.js";
import "../inspector-elements/inputs/devtools-text-input.js";
import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import ShoelaceTheme from "@shoelace-style/shoelace/dist/themes/light.styles.js";
import "../inspector-elements/inputs/new-devtools-text-input.js";
import { CONNECTION_HOSTS, sendMessage } from "../../messaging/messaging.js";

const MESSAGING_CHANNEL = "CustomElementList";

export class DevToolsElementList extends LitElement {
    static get properties() {
        return {
            customElementList: { type: Array },
            customElementTree: { type: Object },
            shownCustomElements: { type: Array },
            currentFilter: { type: Object },
            selectedElement: { type: Object },
            loading: { type: Boolean, reflect: true },
        };
    }

    constructor() {
        super();
        this.loading = true;
        /** @type { import('custom-element-tree').CustomElementTreeInMessageFormat } */
        this.customElementTree = undefined;
        /** @typ { Array<CustomElementNodeInMessageFormat> }*/
        this.shownCustomElements = undefined;
        this.selectedElement = null;
        this.reload();
        this._initSubChannel();
    }

    reload() {
        /** @type {Array<any>} */
        this.customElementList = [];
        this.customElementTree = undefined;
        this.shownCustomElements = undefined;
        this.currentFilter = {};
    }

    /**
     * @param {import('lit').PropertyValues} _changedProperties
     */
    updated(_changedProperties) {
        if (_changedProperties.has("customElementList")) {
            this._updateCurrentShownCustomElements();
        }

        if (_changedProperties.has("selectedElement")) {
            document.body.removeAttribute("aria-loading");
            if (this.selectedElement?.scrollToTargetInDevTools) {
                // this._focusOnListItemAtIndex(this.selectedElement.indexInDevTools);
            }
        }

        if (_changedProperties.has("customElementTree")) {
            this._updateCurrentShownCustomElements();
        }
    }

    _initSubChannel() {
        document.addEventListener(RefreshMessage.type, this.reload.bind(this));
    }

    _updateCurrentShownCustomElements() {
        this.shownCustomElements = this.customElementTree?.elements?.filter(elem => {
            const nameFilterString = this.currentFilter?.nameFilter;
            if (!nameFilterString) return true;

            /** @type { import("custom-element-tree").CustomElementNodeInMessageFormat[]} */
            const children = this.getTreeElementChildrenRecursively(elem);

            const regx = new RegExp(nameFilterString);
            debugger;
            return regx.test(elem.tagName) || children.some(child => regx.test(child.tagName));
        });
    }

    /**
     * @param {import("custom-element-tree").CustomElementNodeInMessageFormat} elem
     */
    getTreeElementChildrenRecursively(elem, collection) {
        if (!collection) {
            collection = [];
        }
        collection = [...collection, ...elem.children];
        for (const child of elem.children) {
            this.getTreeElementChildrenRecursively(child, collection);
        }
        return collection;
    }

    /**
     * @param {any} message
     */
    _log(message) {
        log(MESSAGING_CHANNEL, message);
    }

    /**
     * @param {any} message
     * @param {any} object
     */
    _logObject(message, object) {
        log(MESSAGING_CHANNEL, message, object);
    }

    /**
     * @param {CustomEvent} event
     */
    _onElementSelect(event) {
        const elem = event.detail;
        this._doSelect(elem);
    }

    /**
     * @param {CustomEvent} event
     */
    _doSelect(event) {
        const slTreeItem = event.detail.selection[0];
        if (slTreeItem.scrollWidth !== slTreeItem.clientWidth) {
            slTreeItem.setAttribute("has-overflow", "");
        }
        /** @type {import('custom-element-tree').CustomElementNodeInMessageFormat} */
        const chosenElement = slTreeItem.element;
        const selectEvent = new CustomEvent("devtools-element-select", { detail: { chosenElement } });
        this.dispatchEvent(selectEvent);
    }

    /**
     * @param {{ index: number; __WC_DEV_TOOLS_ELEMENT_DEPTH: number; }} elem
     */
    _getChildElementRange(elem) {
        const elementsBelow = this.customElementList.slice(elem.index + 1);

        let childCount = 0;
        while (elementsBelow.length > 0) {
            const el = elementsBelow.shift();
            if (el.__WC_DEV_TOOLS_ELEMENT_DEPTH <= elem.__WC_DEV_TOOLS_ELEMENT_DEPTH) break;
            childCount++;
        }

        return [elem.index + 1, elem.index + childCount + 1];
    }

    /**
     * @param {any} elem
     */
    _hasChildren(elem) {
        const childElementRange = this._getChildElementRange(elem);
        return childElementRange[0] < childElementRange[1];
    }

    /**
     * @param {string} moveDirection
     */
    _moveFocus(moveDirection) {
        /** @type { HTMLElement } */
        let target = this._getMovementTarget(moveDirection);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    _getMovementTarget(moveDirection) {
        /** @type { HTMLElement } */
        let target;
        if (moveDirection === "down") {
            target = /** @type { HTMLElement } */ (this.shadowRoot.activeElement.nextElementSibling);
            while (!target.offsetParent) {
                target = /** @type { HTMLElement } */ (target.nextElementSibling);
            }
        } else {
            target = /** @type { HTMLElement } */ (this.shadowRoot.activeElement.previousElementSibling);
            while (!target.offsetParent) {
                target = /** @type { HTMLElement } */ (target.previousElementSibling);
            }
        }
        return target;
    }

    _onWordFilterInput(e) {
        const val = e.detail.value;
        this.currentFilter.nameFilter = val.toLowerCase();
        this._updateCurrentShownCustomElements();
    }

    /**
     * @param {number} id
     */
    _spotlight(id) {
        sendMessage(CONNECTION_HOSTS.CONTENT, new HighlightMessage({ id }));
    }

    _spotlightOff() {
        sendMessage(CONNECTION_HOSTS.CONTENT, new HighlightMessage({ id: -1 }));
    }

    render() {
        return html`
            <header>
                <devtools-text-input
                    nolabel
                    @devtools-input=${this._onWordFilterInput}
                    placeholder="Filter by name"
                ></devtools-text-input>

                ${this.renderActions()}
            </header>
            <section class="items">${this.renderElements()}</section>
        `;
    }

    renderActions() {
        return html`
            <span class="actions">
                <sl-icon-button @click=${() => window.location.reload()} name="arrow-clockwise" label="Refresh">
                </sl-icon-button>
            </span>
        `;
    }

    renderElements() {
        if (this.loading) {
            return html`
                <sl-skeleton
                    effect="sheen"
                    style="--color: var(--highlight); --sheen-color: var(--highlight-hover);"
                ></sl-skeleton>
                <sl-skeleton
                    effect="sheen"
                    style="--color: var(--highlight); --sheen-color: var(--highlight-hover);"
                ></sl-skeleton>
                <sl-skeleton
                    effect="sheen"
                    style="--color: var(--highlight); --sheen-color: var(--highlight-hover);"
                ></sl-skeleton>
                <sl-skeleton
                    effect="sheen"
                    style="--color: var(--highlight); --sheen-color: var(--highlight-hover);"
                ></sl-skeleton>
                <sl-skeleton
                    effect="sheen"
                    style="--color: var(--highlight); --sheen-color: var(--highlight-hover);"
                ></sl-skeleton>
                <sl-skeleton
                    effect="sheen"
                    style="--color: var(--highlight); --sheen-color: var(--highlight-hover);"
                ></sl-skeleton>
                <sl-skeleton
                    effect="sheen"
                    style="--color: var(--highlight); --sheen-color: var(--highlight-hover);"
                ></sl-skeleton>
            `;
        }

        if (!this.shownCustomElements) {
            return html``; // ERR
        }

        return html`
            <sl-tree @sl-selection-change=${this._doSelect}>
                ${repeat(
                    this.shownCustomElements,
                    elem => elem.id,
                    elem => this.renderLeaf(elem),
                )}
            </sl-tree>
        `;
    }

    /**
     * @param {import("custom-element-tree").CustomElementNodeInMessageFormat } element
     */
    onDoubleClick(element) {
        sendMessage(CONNECTION_HOSTS.CONTENT, new ScrollIntoViewMessage({ id: element.id }));
    }

    /**
     * @param { import('custom-element-tree').CustomElementNodeInMessageFormat } elem
     **/
    renderLeaf(elem) {
        return html`
            <sl-tree-item
                expanded
                .element=${elem}
                ?is-undefined=${!elem.isDefined}
                ?hasChildren=${this._hasChildren(elem)}
                @dblclick=${() => this.onDoubleClick(elem)}
            >
                ${this.renderHtmlTag(elem)}
                ${repeat(
                    elem.children,
                    child => child.id,
                    child => this.renderLeaf(child),
                )}
            </sl-tree-item>
        `;
    }

    /**
     * @param {import("custom-element-tree").CustomElementNodeInMessageFormat } element
     */
    renderHtmlTag(element) {
        const nodeString = element.nodeText;
        return html`
            <div
                class="element-tree-leaf-content"
                @mouseenter=${() => this._spotlight(element.id)}
                @mouseleave=${() => this._spotlightOff()}
            >
                <span class="html-tag">${nodeString}</span>
            </div>
        `;
    }

    static get styles() {
        return [
            ShoelaceTheme,
            css`
                :host {
                    flex: 1 20 auto;
                    position: relative;
                    max-height: 100%;
                    min-height: 1%;
                    margin-right: 0.5rem;
                }

                section.items {
                    height: calc(100% - 56px);
                    overflow-y: auto;
                    box-sizing: border-box;
                    font-size: 0.8rem;
                }

                header {
                    display: flex;
                    align-items: center;
                    border-bottom: 2px solid var(--border-color);
                    justify-content: space-between;
                    box-sizing: border-box;
                    background: var(--background-color);
                }

                sl-skeleton {
                    --color: var(--highlight);
                    --sheen-color: var(--highlight-hover);
                    opacity: 0.3;
                    margin-top: 0.5rem;
                    margin-left: 0.5rem;
                }

                sl-skeleton:nth-child(1) {
                    width: 95%;
                }
                sl-skeleton:nth-child(2) {
                    width: 92%;
                }
                sl-skeleton:nth-child(3) {
                    width: 93%;
                }
                sl-skeleton:nth-child(4) {
                    width: 80%;
                }
                sl-skeleton:nth-child(5) {
                    width: 85%;
                }
                sl-skeleton:nth-child(6) {
                    width: 87%;
                }
                sl-skeleton:nth-child(7) {
                    width: 85%;
                }

                sl-tree {
                    padding: 0.5rem 0;
                    --indent-size: var(--sl-spacing-small);
                }

                .html-tag {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    font-size: 0.8rem;
                }

                sl-tree-item {
                    overflow: hidden;
                }

                sl-tree-item::part(label) {
                    width: 100%;
                }

                .element-tree-leaf-content {
                    width: 100%;
                    padding: 0.2rem;
                }

                sl-tree-item::part(indentation) {
                    background: inherit;
                    height: 1.6rem;
                    z-index: 100;
                    border: 0;
                }

                sl-tree-item::part(expand-button) {
                    width: 0.8rem;
                    height: 0.8rem;
                    background: inherit;
                    z-index: 100;
                    padding-right: calc(
                        var(--sl-spacing-x-small) - 2px
                    ); /* Prevent ugly overflow we cuase by background */
                }

                sl-tree-item::part(item) {
                    transition: 100ms ease-in-out;
                }

                sl-tree-item::part(item):hover {
                    background: var(--highlight-hover);
                }

                sl-tree-item[selected][has-overflow] > div {
                    animation: 10000ms slide-text;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                }

                @keyframes slide-text {
                    0% {
                        transform: translate(0px, 0px);
                    }
                    30% {
                        transform: translate(-50%, 0px);
                    }
                    50% {
                        transform: translate(-50%, 0px);
                    }
                    80% {
                        transform: translate(0%, 0px);
                    }
                }

                .actions {
                    display: flex;
                }

                .tag-show-button,
                .refresh-button {
                    fill: var(--paragraph-color);
                    background: none;
                    border: none;
                    cursor: pointer;
                    margin-right: 1rem;
                }

                .refresh-button svg {
                    transform: rotate(0);
                    transition: 400ms ease-in-out;
                }

                .refresh-button:hover svg {
                    transform: rotate(-150deg);
                }

                .tag-show-button {
                    margin-right: 0.2rem;
                    opacity: 0.5;
                }

                .tag-show-button svg {
                    width: 20px;
                }

                .tag-show-button[selected] {
                    opacity: 1;
                }

                devtools-text-input {
                    --font-size: 1rem;
                }

                #error-message {
                    animation: 2000ms show-up;
                    opacity: 1;
                }

                @keyframes show-up {
                    0% {
                        opacity: 0;
                    }
                    99% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @media only screen and (max-width: 1000px) {
                    :host {
                        margin-right: 0;
                    }
                }
            `,
        ];
    }
}

customElements.define("devtools-elements-list", DevToolsElementList);
