import { css, html, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { log, postMessage } from '../../util/messaging';
import { MESSAGE_TYPE } from '../../types/message-types.js';
import { REFRESH_ICON } from '../icons';
import '../list-elements/devtools-list-item.js';
import '../inspector-elements/inputs/devtools-text-input.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/tree-item/tree-item.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import ShoelaceTheme from '@shoelace-style/shoelace/dist/themes/light.styles.js';
import "../inspector-elements/inputs/new-devtools-text-input.js";

const MESSAGING_CHANNEL = 'CustomElementList';

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
        this.selectedElement = null;
        this.reload();
        this._initSubChannel();
    }

    reload() {
        /** @type {Array<any>} */
        this.customElementList = [];
        this.customElementTree = undefined;
        /**
         * @type {Array<any>}
         */
        this.shownCustomElements = [];
        this.currentFilter = {};
    }

    /**
     * @param {import('lit').PropertyValues} _changedProperties
     */
    updated(_changedProperties) {
        if (_changedProperties.has('customElementList')) {
            this._updateCurrentShownCustomElements();
        }

        if (_changedProperties.has('selectedElement')) {
            document.body.removeAttribute('aria-loading');
            if (this.selectedElement?.scrollToTargetInDevTools) {
                this._focusOnListItemAtIndex(this.selectedElement.indexInDevTools);
            }
        }
    }

    _initSubChannel() {
        document.addEventListener(MESSAGE_TYPE.REFRESH.toString(), this.reload.bind(this));
    }

    _updateCurrentShownCustomElements() {
        this.shownCustomElements = this.customElementList.filter(elem => {
            const nameFilterString = this.currentFilter?.nameFilter;
            if (!nameFilterString) return true;

            const regx = new RegExp(nameFilterString);
            return regx.test(elem.name);
        });
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
        const selectEvent = new CustomEvent('devtools-element-select', { detail: { chosenElement } });
        this.dispatchEvent(selectEvent);
    }

    /**
     * @param {number} index
     */
    _getElementInTreeByIndex(index) {
        const elems = this.shadowRoot.querySelectorAll('devtools-list-item');
        return elems[index];
    }

    /**
     * @param {any} elem
     */
    _getChildElementsInTree(elem) {
        const childElementRange = this._getChildElementRange(elem);
        const listElements = Array.from(this.shadowRoot.querySelectorAll('devtools-list-item'));
        const children = listElements.slice(childElementRange[0], childElementRange[1]);

        return children;
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
     * @param {CustomEvent} event
     * */
    _toggleChildren(event) {
        const elem = event.detail.element;
        const elemInTree = this._getElementInTreeByIndex(elem.index);
        const isHidden = elemInTree.hasAttribute('children-hidden');

        const children = this._getChildElementsInTree(elem);
        if (isHidden) {
            children.forEach(child => {
                child.removeAttribute('hidden');
                // To not have attribute - state mismatch. This needs
                // to be thought through when the tree rework is done
                child.removeAttribute('children-hidden');
            });
        } else {
            children.forEach(child => child.setAttribute('hidden', ''));
        }
        elemInTree.toggleAttribute('children-hidden');
    }

    /**
     * @param {string} moveDirection
     */
    _moveFocus(moveDirection) {
        /** @type { HTMLElement } */
        let target = this._getMovementTarget(moveDirection);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    _getMovementTarget(moveDirection) {
        /** @type { HTMLElement } */
        let target;
        if (moveDirection === 'down') {
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

    _focusOnListItemAtIndex(index) {
        const target = /** @type {HTMLElement} */ (
            Array.from(this.shadowRoot.querySelectorAll('devtools-list-item'))[index]
        );
        if (target) {
            //target.focus(); // Can cause High levels of Jank if applied with the spotlight on focus action
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    _scrollToElementAtIndex(index) {
        const target = /** @type {any} */ (Array.from(this.shadowRoot.querySelectorAll('devtools-list-item'))[index]);
        if (target) {
            target.scrollToElement();
        }
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
        postMessage({
            type: MESSAGE_TYPE.HIGHLIGHT,
            id: id,
        });
    }

    _spotlightOff() {
        postMessage({ type: MESSAGE_TYPE.HIGHLIGHT, id: -1 });
    }

    render() {
        return html`
            <header>
                <new-devtools-text-input
                    nolabel
                    @devtools-input=${this._onWordFilterInput}
                    placeholder="Filter by name"
                ></new-devtools-text-input>

                ${this.renderActions()}
            </header>
            <section class="items">
                <!--${this.renderElements()}-->
                ${this.renderElementsNew()}
            </section>
        `;
    }

    renderActions() {
        return html`
                <span class="actions">
                    <sl-icon-button
                            @click=${() => window.location.reload()}
                            name="arrow-clockwise"
                            label="Refresh"
                        >
                    </sl-icon-button>
                </span>
        `;
    }

    renderElementsNew() {
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

        if (!this.customElementTree) {
            return html``; // ERR
        }

        return html`
            <sl-tree @sl-selection-change=${this._doSelect}>
                ${repeat(
            this.customElementTree.elements,
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
        postMessage({
            type: MESSAGE_TYPE.SCROLL_INTO_VIEW,
            id: element.id,
        });
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

        return html`
            ${repeat(
            this.shownCustomElements,
            elem => elem.name,
            elem => html`
                    <devtools-list-item
                        .element=${elem}
                        .relativeDepth=${elem.__WC_DEV_TOOLS_ELEMENT_DEPTH}
                        ?selected=${this.selectedElement?.indexInDevTools === elem.index}
                        ?is-undefined=${!elem.__WC_DEV_TOOLS_ELEMENT_IS_DEFINED}
                        ?hasChildren=${this._hasChildren(elem)}
                        @list-item-selected=${this._onElementSelect}
                        @list-item-children-toggle=${this._toggleChildren}
                        @list-item-focus-next=${() => this._moveFocus('down')}
                        @list-item-focus-previous=${() => this._moveFocus('up')}
                    >
                    </devtools-list-item>
                `,
        )}
            ${this.customElementList.length <= 0
                ? html`<div id="error-message">
                      <p>
                          If the list has not populated, but there are custom elements in the page, try the following:
                      </p>

                      <ol>
                          <li>Refresh the page</li>
                          <li>Re-open devtools</li>
                          <li>Re-enable or Re-install the extension</li>
                      </ol>

                      <p>
                          If none of the above make the devtools function, it might be due to a bug. Please submit your
                          findings to
                          <a target="_blank" href="https://github.com/Matsuuu/web-component-devtools/issues"
                              >The GitHub Repository</a
                          >
                          so it gets fixed as soon as possible.
                      </p>
                  </div> `
                : ''}
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
                    padding-right: calc(var(--sl-spacing-x-small) - 2px); /* Prevent ugly overflow we cuase by background */
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
                    --font-size: 1.3rem;
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

customElements.define('devtools-elements-list', DevToolsElementList);
