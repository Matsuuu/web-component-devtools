import { css, html, LitElement } from 'lit';
import { postMessage } from '../util/messaging.js';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { ARROW_UP } from './icons.js';

export class CustomElementsListItem extends LitElement {
    static get properties() {
        return {
            element: { type: Object },
            selected: { type: Boolean, reflect: true },
            hasChildren: { type: Boolean, reflect: true },
            relativeDepth: { type: Number, reflect: true },
            showTags: { type: String }
        };
    }

    constructor() {
        super();
        this.element = null;
        this.selected = false;
        this.hasChildren = false;
        this.tabIndex = 0;
        this.relativeDepth = 0;
        this.showTags = true;
    }

    firstUpdated() {
        this.addEventListener('mouseenter', this._spotlight);
        this.addEventListener('mouseleave', this._spotlightOff);
        this.addEventListener('click', this._select);

        this.addEventListener('keydown', this._handleKeyboard);
        this.addEventListener('focus', this._spotlight);
        this.addEventListener('blur', this._spotlightOff);
    }

    /**
     * @param {KeyboardEvent} e
     */
    _handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('list-item-focus-previous'));
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('list-item-focus-next'));
                break;
            case 'Enter':
                e.preventDefault();
                this._select();
                break;
            case 'ArrowLeft': // TODO
            case 'ArrowRight':
                e.preventDefault();
                this._toggleChildren();
                break;
        }
    }

    _spotlight() {
        postMessage({
            type: MESSAGE_TYPE.HIGHLIGHT,
            index: this.element.index,
        });
    }

    _spotlightOff() {
        postMessage({ type: MESSAGE_TYPE.HIGHLIGHT, index: -1 });
    }

    _select() {
        const selectEvent = new CustomEvent('list-item-selected', {
            detail: this.element,
        });
        this.dispatchEvent(selectEvent);
    }

    _toggleChildren() {
        const toggleEvent = new CustomEvent('list-item-children-toggle', {
            detail: {
                element: this.element,
            }
        });
        this.dispatchEvent(toggleEvent);
    }

    render() {
        return html`
            <li style="padding-left: ${this.relativeDepth}rem">
                <span class="list-item-flexer">
                    <span class="custom-element-span">
                        ${this.hasChildren
                ? html` <span class="child-toggler" @click=${this._toggleChildren}>${ARROW_UP}</span> `
                : ''}
                        <span>${this.element.name}</span>
                    </span>
                    ${this.renderHtmlTag()}
                </span>
            </li>
        `;
    }

    renderHtmlTag() {
        if (!this.showTags) return '';
        const limit = 30;
        const nodeString = this.element.__WC_DEV_TOOLS_NODE_STRING;
        const ellipsis = nodeString.length > limit ? '...' : '';
        return html`
            <span class="html-tag"> ${this.selected ? nodeString : nodeString.substring(0, limit) + ellipsis}</span>
        `;
    }

    static get styles() {
        return css`
            :host {
                display: list-item;
                padding: 0.1rem 0.1rem 0.1rem 0.75rem;
                list-style: none;
                transition: 100ms ease-in-out;
                cursor: pointer;
                color: var(--highlight);
                user-select: none;
            }

            :host([haschildren]) {
                padding-left: 0.1rem;
            }

            :host([hidden]) {
                display: none;
            }

            .child-toggler svg {
                transition: 100ms ease-in-out;
                transform: rotate(180deg);
                height: 0.4rem;
                width: 0.4rem;
            }

            :host([children-hidden]) .child-toggler svg {
                transform: rotate(90deg);
            }

            :host(:hover),
            :host(:focus) {
                background: #d8e9ef;
            }

            :host([selected]) {
                background: #b7e1ef;
            }
            .list-item-flexer {
                display: flex;
                justify-content: space-between;
            }

            .html-tag {
                color: var(--button-text);
                opacity: 0.5;
                padding-left: 2rem;
                text-align: right;
            }

            .custom-element-span {
                white-space: nowrap;
            }
        `;
    }
}

if (!customElements.get('custom-elements-list-item')) {
    customElements.define('custom-elements-list-item', CustomElementsListItem);
}
