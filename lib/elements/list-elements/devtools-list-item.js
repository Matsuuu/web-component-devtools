import { css, html, LitElement } from 'lit';
import { postMessage } from '../../util/messaging.js';
import { MESSAGE_TYPE } from '../../types/message-types.js';
import { ARROW_UP } from '../icons.js';
import '../devtools-rightclick-menu.js';
import { DevToolsRightClickMenu } from '../devtools-rightclick-menu.js';

export class DevToolsListItem extends LitElement {
    static get properties() {
        return {
            element: { type: Object },
            selected: { type: Boolean, reflect: true },
            hasChildren: { type: Boolean, reflect: true },
            relativeDepth: { type: Number, reflect: true },
            isUndefined: { type: Boolean, attribute: "is-undefined" },
            showTags: { type: String },
        };
    }

    constructor() {
        super();
        this.element = null;
        this.selected = false;
        this.hasChildren = false;
        this.tabIndex = 0;
        this.relativeDepth = 0;
        this.isUndefined = false;
        this.showTags = true;
    }

    firstUpdated() {
        if (this.isUndefined) {
            this.title = "This element has not been defined in the customElements registry";
            return;
        }
        this.addEventListener('mouseenter', this._spotlight);
        this.addEventListener('mouseleave', this._spotlightOff);
        this.addEventListener('click', this._select);

        this.addEventListener('keydown', this._handleKeyboard);
        this.addEventListener('focus', this._spotlight);
        this.addEventListener('blur', this._spotlightOff);
        this.addEventListener('contextmenu', this._onContextMenu);
    }

    _onContextMenu(e) {
        e.preventDefault();
        this._removeRightClickMenu();
        const rightclickMenu = /** @type { DevToolsRightClickMenu } */ (
            document.createElement('devtools-right-click-menu')
        );
        rightclickMenu.style.setProperty('--top-offset', e.y + 10 + 'px');
        rightclickMenu.style.setProperty('--left-offset', e.x + 10 + 'px');
        rightclickMenu.target = this;

        document.body.appendChild(rightclickMenu);
    }

    _removeRightClickMenu() {
        const oldMenu = document.querySelector('devtools-right-click-menu');
        oldMenu?.remove();
    }

    scrollToElement() {
        postMessage({
            type: MESSAGE_TYPE.SCROLL_INTO_VIEW,
            index: this.element.index,
        });
        this._select();
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
        if (this.selected) return;

        this._removeRightClickMenu();
        document.body.setAttribute('aria-loading', '');
        const selectEvent = new CustomEvent('list-item-selected', {
            detail: this.element,
        });
        this.dispatchEvent(selectEvent);
    }

    _toggleChildren() {
        const toggleEvent = new CustomEvent('list-item-children-toggle', {
            detail: {
                element: this.element,
            },
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
                        ${this.isUndefined ? html`<span class="info-text">Element not defined</span>` : ''}
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
        const ellipsis = nodeString?.length > limit ? '...' : '';
        return html`
            <span class="html-tag"> ${this.selected ? nodeString : nodeString?.substring(0, limit) + ellipsis}</span>
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
                fill: var(--list-item-expand-marker-color);
            }

            :host([children-hidden]) .child-toggler svg {
                transform: rotate(90deg);
            }

            :host(:hover),
            :host(:focus) {
                background: var(--highlight-hover);
            }

            :host([is-undefined]) {
                color: red;
                cursor: help;
            }

            :host([selected]) {
                background: var(--highlight-selected);
            }
            .list-item-flexer {
                display: flex;
                justify-content: space-between;
            }

            .info-text {
                color: var(--button-text);
                padding: 0 0.25rem;
                opacity: 0.5;
            }

            .html-tag {
                color: var(--button-text);
                opacity: 0.5;
                padding-left: 2rem;
                text-align: right;
                word-break: break-word;
                /*animation: 1000ms ease-in blink-fade;*/
            }

        /** TODO: Trigger this */
            @keyframes blink-fade {
                0% {
                    background: var(--highlight);
                }

                100% {
                    background: transparent;
                }
            }

            .custom-element-span {
                white-space: nowrap;
            }
        `;
    }
}

if (!customElements.get('devtools-list-item')) {
    customElements.define('devtools-list-item', DevToolsListItem);
}
