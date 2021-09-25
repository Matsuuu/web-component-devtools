import { css, html, LitElement } from 'lit';
import './devtools-inspector.js';

export class DevToolsActionArea extends LitElement {
    renderTabs() {
        return html`
            <div class="actions">
                <button class="action-tab" selected>Inspector</button>
                <button class="action-tab">Source</button>
                <button class="action-tab">Console</button>
            </div>
        `;
    }

    render() {
        return html` ${this.renderTabs()}
            <devtools-inspector></devtools-inspector>`;
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
            }

            .actions {
                display: flex;
                border-bottom: 2px solid rgb(238, 238, 238);
                padding: 0.5rem;
                justify-content: flex-start;
            }

            .action-tab {
                padding: 0 0.5rem;
                border: none;
                border-right: 2px solid rgb(238, 238, 238);
                background: none;
            }

            .action-tab[selected] {
                font-weight: bold;
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
