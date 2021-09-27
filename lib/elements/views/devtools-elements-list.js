import { css, html, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { log } from '../../util/messaging';
import { MESSAGE_TYPE } from '../../types/message-types.js';
import { HTML_TAG, REFRESH_ICON } from '../icons';
import '../list-elements/devtools-list-item.js';
import '../inspector-elements/inputs/devtools-text-input.js';

const MESSAGING_CHANNEL = 'CustomElementList';

export class DevToolsElementList extends LitElement {
    static get properties() {
        return {
            customElementList: { type: Array },
            shownCustomElements: { type: Array },
            currentFilter: { type: Object },
            customElementMap: { type: Object },
            selectedElement: { type: Object },
            showTags: { type: Boolean },
        };
    }

    constructor() {
        super();
        this.showTags = true;
        this.selectedElement = null;
        this.reload();
        this._initSubChannel();
    }

    reload() {
        /** @type {Array<any>} */
        this.customElementList = [];
        this.customElementMap = {};
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
        if (_changedProperties.has("customElementList") || _changedProperties.has("customElementMap")) {
            this._updateCurrentShownCustomElements();
        }

        if (_changedProperties.has("selectedElement")) {
            document.body.removeAttribute('aria-loading');
            if (this.selectedElement.scrollToTargetInDevTools) {
                this._focusOnListItemAtIndex(this.selectedElement.indexInDevTools)
            }
        }

    }

    /**
     * @param {DevToolsElement} reselectTarget
     */
    doReSelect(reselectTarget) {
        this._doSelect(reselectTarget);
        this._scrollToElementAtIndex(reselectTarget.indexInDevTools);
    }

    _initSubChannel() {
        document.addEventListener(MESSAGE_TYPE.REFRESH.toString(), this.reload.bind(this));
        document.addEventListener(MESSAGE_TYPE.SELECT.toString(), () => document.body.setAttribute("aria-loading", ""));
        /*document.addEventListener(MESSAGE_TYPE.QUERY_RESULT.toString(), (event) => {
            const message = event.detail;

            if (message.data) {
                this.customElementMap = message.data.elementsMap;
                this.customElementList = message.data.elementsArray;
                this._updateCurrentShownCustomElements();
            }

            const reselectTarget = message.reselectTarget;
            if (reselectTarget) {
                const elem = this.shownCustomElements[reselectTarget.indexInDevTools];
                this._doSelect(elem);
                this._scrollToElementAtIndex(reselectTarget.indexInDevTools);
            }
        });*/
        /*document.addEventListener(MESSAGE_TYPE.SELECT_RESULT.toString(), (event) => {
            document.body.removeAttribute('aria-loading');
            const message = event.detail;
            this.selectedElement = message.data;
            if (this.selectedElement.scrollToTargetInDevTools) {
                this._focusOnListItemAtIndex(this.selectedElement.indexInDevTools);
            }
        });*/
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

    _doSelect(elem) {
        const selectEvent = new CustomEvent("devtools-element-select", { detail: { elem } });
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
        const target = /** @type {HTMLElement} */ (Array.from(
            this.shadowRoot.querySelectorAll('devtools-list-item'),
        )[index]);
        if (target) {
            //target.focus(); // Can cause High levels of Jank if applied with the spotlight on focus action
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    _scrollToElementAtIndex(index) {
        const target = /** @type {any} */ (Array.from(
            this.shadowRoot.querySelectorAll('devtools-list-item'),
        )[index]);
        if (target) {
            target.scrollToElement();
        }
    }

    _onWordFilterInput(e) {
        const val = e.detail.value;
        this.currentFilter.nameFilter = val.toLowerCase();
        this._updateCurrentShownCustomElements();
    }

    render() {
        return html`
            <header>
                <devtools-text-input
                    nolabel
                    @devtools-input=${this._onWordFilterInput}
                    placeholder="Filter by name"
                ></devtools-text-input>

                <span class="actions">
                    <button
                        title="Show HTML Tags next to custom elements"
                        ?selected=${this.showTags}
                        @click=${() => (this.showTags = !this.showTags)}
                        class="tag-show-button"
                    >
                        ${HTML_TAG}
                    </button>
                    <button @click=${() => window.location.reload()} class="refresh-button">${REFRESH_ICON}</button>
                </span>
            </header>
            <ul>
                ${this.renderElements()}
            </ul>
        `;
    }

    renderElements() {
        return html`
            ${repeat(
            this.shownCustomElements,
            elem => elem.name,
            elem => html`
                    <devtools-list-item
                        .element=${elem}
                        .relativeDepth=${elem.__WC_DEV_TOOLS_ELEMENT_DEPTH}
                        ?selected=${this.selectedElement?.indexInDevTools === elem.index}
                        .showTags=${this.showTags}
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
                ? html`<div id="error-message"><p>
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
                          <a target="_blank" href="https://github.com/Matsuuu/web-component-devtools/issues">The GitHub Repository</a>
                          so it gets fixed as soon as possible.
                      </p></div> `
                : ''}
        `;
    }

    static get styles() {
        return css`
            :host {
                flex: 1 20 auto;
                position: relative;
                max-height: 100%;
                min-height: 1%;
                margin-right: 0.5rem;
            }

            ul {
                padding: 0 1rem;
                max-height: calc(100% - 78px);
                overflow-y: auto;
                box-sizing: border-box;
                font-size: 0.8rem;
            }

            header {
                display: flex;
                align-items: center;
                border-bottom: 2px solid var(--border-color);
                height: 56px;
                justify-content: space-between;
                box-sizing: border-box;
                background: var(--background-color);
                padding: 0 1rem;
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
            0% { opacity: 0; }
            99% { opacity: 0; }
            100% { opacity: 1;  }
        }

            @media only screen and (max-width: 1000px) {
                :host {
                    margin-right: 0;
                }
            }
        `;
    }
}

customElements.define('devtools-elements-list', DevToolsElementList);
