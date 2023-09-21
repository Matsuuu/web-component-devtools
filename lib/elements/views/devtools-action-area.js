import { css, html, LitElement } from 'lit';
import './action-views/devtools-inspector.js';
import './action-views/devtools-source-view.js';
import './action-views/devtools-console-view.js';

const TABS = {
    INSPECTOR: 'Inspector',
    SOURCE: 'Source',
    CONSOLE: 'Console',
};

export class DevToolsActionArea extends LitElement {
    static get properties() {
        return {
            selectedTab: { type: String },
            selectedElement: { type: Object },
            loading: { type: Boolean, reflect: true }
        };
    }

    constructor() {
        super();
        this.selectedTab = TABS.INSPECTOR;
        this.selectedElement = null;
        this.loading = true;
    }

    /**
     * @param {import('lit').PropertyValues} _changedProperties
     */
    updated(_changedProperties) {
        if (_changedProperties.has('selectedTab')) {
            this.modifyIndicator();
        }
    }

    /**
     * @param {string} newTab
     */
    changeTab(newTab) {
        this.selectedTab = newTab;
    }

    modifyIndicator() {
        const selectedTabElem = /** @type HTMLElement */ (this.shadowRoot.querySelector('#' + this.selectedTab));
        this.style.setProperty('--tab-indicator-width', selectedTabElem.clientWidth + 'px');
        this.style.setProperty('--tab-indicator-offset', selectedTabElem.offsetLeft + 'px');
    }

    renderTabs() {
        return html`
            <div class="actions">
                <button
                    @click=${() => this.changeTab(TABS.INSPECTOR)}
                    id="${TABS.INSPECTOR}"
                    class="action-tab"
                    ?selected=${this.selectedTab === TABS.INSPECTOR}
                >
                    Inspector
                </button>
                <button
                    @click=${() => this.changeTab(TABS.SOURCE)}
                    id="${TABS.SOURCE}"
                    class="action-tab"
                    ?selected=${this.selectedTab === TABS.SOURCE}
                >
                    Source
                </button>
                <button
                    @click=${() => this.changeTab(TABS.CONSOLE)}
                    id="${TABS.CONSOLE}"
                    class="action-tab"
                    ?selected=${this.selectedTab === TABS.CONSOLE}
                >
                    Console
                </button>
                <span class="tab-indicator"></span>
            </div>
        `;
    }

    renderView() {
        switch (this.selectedTab) {
            case TABS.CONSOLE:
                return html`<devtools-console-view .selectedElement=${this.selectedElement}></devtools-console-view>`;
            case TABS.SOURCE:
                return html`<devtools-source-view .selectedElement=${this.selectedElement}></devtools-source-view>`;
            case TABS.INSPECTOR:
            default:
                return html`<devtools-inspector ?loading=${this.loading} .selectedElement=${this.selectedElement}></devtools-inspector>`;
        }
    }

    render() {
        return html` ${this.renderTabs()} ${this.renderView()} `;
    }

    static get styles() {
        return css`
            :host {
                --area-size: 40%;
                flex-basis: var(--area-size);
                display: flex;
                flex-direction: column;

                height: 100%;
                max-height: 100%;
                overflow-y: auto;
                box-sizing: border-box;

                --tab-indicator-width: 20px;
                --tab-indicator-offset: 0px;
            }

            .actions {
                display: flex;
                border-bottom: 2px solid var(--border-color);
                padding: 0;
                justify-content: flex-start;
                background: var(--darker-background-color);
                position: relative;
            }

            .action-tab {
                height: 100%;
                padding: 0.5rem;
                border: none;
                border-right: 2px solid var(--border-color);
                background: none;
                color: var(--faded-paragraph-color);
                cursor: pointer;
            }

            .action-tab:hover {
                background: var(--darker-background-hover-color);
            }

            .action-tab[selected] {
                color: var(--selected-paragraph-color);
            }

            .tab-indicator {
                transition: 100ms ease-in-out;
                position: absolute;
                bottom: 0;
                left: 0;
                width: var(--tab-indicator-width);
                left: var(--tab-indicator-offset);
                height: 2px;
                background: var(--highlight);
            }

            @media only screen and (max-width: 1000px) {
                :host {
                    --area-size: 60%;
                    flex-direction: column;
                    flex-basis: var(--area-size);
                }
            }
        `;
    }
}

if (!customElements.get('devtools-action-area')) {
    customElements.define('devtools-action-area', DevToolsActionArea);
}
