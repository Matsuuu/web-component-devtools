import { css, html, LitElement } from 'lit';
import './views/devtools-action-area.js';
import './views/devtools-elements-list.js';
import './views/devtools-divider.js';

export class DevToolsPanel extends LitElement {
    static get properties() {
        return {
            verticalView: { type: Boolean },
        };
    }

    constructor() {
        super();

        const mediaQ = window.matchMedia('(max-width: 1000px)');
        mediaQ.addEventListener('change', mediaQresponse => {
            this.verticalView = mediaQresponse.matches;
        });
        this.verticalView = mediaQ.matches;
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
            <devtools-elements-list></devtools-elements-list>
            <devtools-divider @devtools-resize=${this.onResize}></devtools-divider>
            <devtools-action-area></devtools-action-area>
        `;
    }

    static get styles() {
        return css`
            :host {
                height: 100%;
                max-height: 100%;
                display: flex;
                flex-direction: row;
                --action-area-size: 40%;
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
