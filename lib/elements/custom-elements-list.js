import { css, html, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat';
import { postMessage, log } from '../util/messaging';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { CustomElementsInspector } from './custom-elements-inspector';
import { REFRESH_ICON } from './icons';
import './custom-elements-list-item.js';
import './devtools-text-input.js';

const MESSAGING_CHANNEL = 'CustomElementList';

/**
 * The depth sorting code and a lot more in this class is just an utter mess rn
    * and I'm sorry if you have to wonder over here
    * 
    * - Matsuuu
 * */
class CustomElementList extends LitElement {
    static get properties() {
        return {
            customElementList: { type: Array },
            shownCustomElements: { type: Array },
            currentFilter: { type: Object },
            customElementMap: { type: Object },
            selectedElement: { type: Object },
            customElementsInspector: { type: Object },
        };
    }

    constructor() {
        super();
        /** @type {CustomElementsInspector} */
        this.customElementsInspector = null;
        this.reload();
        this._initSubChannel();
    }

    reload() {
        /** @type {Array<any>} */
        this.customElementList = [];
        this.customElementMap = {};
        this.selectedElement = null;
        this.shownCustomElements = [];
        this.currentFilter = {};
    }

    _initSubChannel() {
        document.addEventListener(MESSAGE_TYPE.REFRESH.toString(), this.reload.bind(this));
        document.addEventListener(MESSAGE_TYPE.INIT.toString(), () => { });
        document.addEventListener(MESSAGE_TYPE.QUERY_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            const message = event.detail;

            if (message.data) {
                this.customElementMap = message.data.elementsMap;
                this.customElementList = message.data.elementsArray;
                this._updateCurrentShownCustomElements();
            }
        });
        document.addEventListener(MESSAGE_TYPE.SELECT_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            const message = event.detail;
            this.selectedElement = message.data;
            this._focusOnListItemAtIndex(message.data.indexInDevTools);
        });
    }

    _updateCurrentShownCustomElements() {
        this.shownCustomElements = this.customElementList.filter(elem => {
            const nameFilterString = this.currentFilter?.nameFilter;
            if (!nameFilterString) return true;

            const regx = new RegExp(nameFilterString);
            return regx.test(elem.name);
        });
        this._calculateRelativeDepths();
    }

    firstUpdated() {
        this.customElementsInspector = document.querySelector('custom-elements-inspector');
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

    _query() {
        postMessage({ type: MESSAGE_TYPE.QUERY });
    }

    /**
     * @param {CustomEvent} event
     */
    _onElementSelect(event) {
        const elem = event.detail;
        this.customElementsInspector.setSelectedElement(elem);
    }

    /**
     * @param {number} index
     */
    _getElementInTreeByIndex(index) {
        const elems = this.shadowRoot.querySelectorAll('custom-elements-list-item');
        return elems[index];
    }

    /**
     * @param {any} elem
     */
    _getChildElementsInTree(elem) {
        const childElementRange = this._getChildElementRange(elem);
        const listElements = Array.from(this.shadowRoot.querySelectorAll('custom-elements-list-item'));
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

    _calculateRelativeDepths() {
        // This is some of that code that makes you wonder if you
        // should just stop trying to make thhe sorting work like this
        // and just rework the sorting tree system
        const minDepth = Math.min(...this.shownCustomElements.map(elem => elem.__WC_DEV_TOOLS_ELEMENT_DEPTH));
        const rootElements = this.shownCustomElements.filter(elem => elem.__WC_DEV_TOOLS_ELEMENT_DEPTH === minDepth);

        let currentDepth = -1;

        const recursiveDepthCalc = elem => {
            currentDepth++;
            let currentDepthAtStart = currentDepth;

            elem.__WC_DEV_TOOLS_ELEMENT_RELATIVE_DEPTH = currentDepth;
            const elemChildRange = this._getChildElementRange(elem);
            const elemChildren = this.customElementList.slice(elemChildRange[0], elemChildRange[1]);
            const minDepthInChildren = Math.min(...elemChildren.map(el => el.__WC_DEV_TOOLS_ELEMENT_DEPTH));
            elemChildren
                .filter(el => el.__WC_DEV_TOOLS_ELEMENT_DEPTH === minDepthInChildren)
                .forEach(childEl => {
                    currentDepth = currentDepthAtStart;
                    recursiveDepthCalc(childEl);
                });
        };
        rootElements.forEach(rootEl => {
            currentDepth = -1;
            recursiveDepthCalc(rootEl);
        });
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
        const elem = event.detail;
        const children = this._getChildElementsInTree(elem);
        children.forEach(child => child.toggleAttribute('hidden'));
        this._getElementInTreeByIndex(elem.index).toggleAttribute('children-hidden');
    }

    /**
     * @param {string} moveDirection
     */
    _moveFocus(moveDirection) {
        /** @type { HTMLElement } */
        let target;
        if (moveDirection === 'down') {
            target = /** @type HTMLElement */ (this.shadowRoot.activeElement.nextElementSibling);
        } else {
            target = /** @type HTMLElement */ (this.shadowRoot.activeElement.previousElementSibling);
        }
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    _focusOnListItemAtIndex(index) {
        const target = /** @type {HTMLElement} */ (
            Array.from(this.shadowRoot.querySelectorAll('custom-elements-list-item'))[index]
        );
        if (target) {
            //target.focus(); // Can cause High levels of Jank if applied with the spotlight on focus action
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

                <button @click=${this._query} class="refresh-button">${REFRESH_ICON}</button>
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
                    <custom-elements-list-item
                        .element=${elem}
                        .relativeDepth=${elem.__WC_DEV_TOOLS_ELEMENT_RELATIVE_DEPTH}
                        ?selected=${this.selectedElement?.indexInDevTools === elem.index}
                        ?hasChildren=${this._hasChildren(elem)}
                        @list-item-selected=${this._onElementSelect}
                        @list-item-children-toggle=${this._toggleChildren}
                        @list-item-focus-next=${() => this._moveFocus('down')}
                        @list-item-focus-previous=${() => this._moveFocus('up')}
                    >
                    </custom-elements-list-item>
                `,
        )}
        `;
    }

    static get styles() {
        return css`
            :host {
                flex: 1 20 auto;
                position: relative;
                max-height: 100%;
                min-height: 1%;
            }

            ul {
                padding: 0 1rem;
                max-height: calc(100% - 78px);
                overflow-y: auto;
                box-sizing: border-box;
            }

            header {
                display: flex;
                align-items: center;
                border-bottom: 2px solid #eeeeee;
                height: 56px;
                justify-content: space-between;
                box-sizing: border-box;
                background: var(--background-color);
                padding: 0 1rem;
            }

            .refresh-button {
                background: none;
                border: none;
                cursor: pointer;
                transition: 400ms ease-in-out;
                transform: rotate(0);
                margin-right: 1rem;
            }

            .refresh-button:hover {
                transform: rotate(-150deg);
            }

            devtools-text-input {
                --font-size: 1.3rem;
            }
        `;
    }
}

customElements.define('custom-elements-list', CustomElementList);
