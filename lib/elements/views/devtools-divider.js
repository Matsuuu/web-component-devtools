import { css, html, LitElement } from 'lit';

export class DevToolsDivider extends LitElement {

    static get properties() {
        return {
            onResizeMouseMoveListener: { type: Object }
        }
    }

    constructor() {
        super();
        this.onResizeMouseMoveListener = this.onResize.bind(this);
    }

    onResize(e) {
        const resizeData = {
            y: e.clientY,
            x: e.clientX
        }
        this.dispatchEvent(new CustomEvent("devtools-resize", { detail: resizeData }));
    }

    resizeStart() {
        document.addEventListener('mousemove', this.onResizeMouseMoveListener);
        const removeListener = () => {
            document.removeEventListener('mousemove', this.onResizeMouseMoveListener);
            document.removeEventListener('mouseup', removeListener);
            document.removeEventListener('mouseleave', removeListener);
        };
        document.addEventListener('mouseup', removeListener);
        document.addEventListener('mouseleave', removeListener);
    }

    resizeEnd() {
        document.removeEventListener('mousemove', this.onResizeMouseMoveListener);
    }

    render() {
        return html`
            <div class="splitter" @mousedown=${this.resizeStart}><span></span></div>
`;
    }

    static get styles() {
        return css`
            .splitter {
                position: sticky;
                background: var(--background-color);
                top: 0;
                width: 4px;
                height: 100%;
                padding: 0 1rem;
                display: flex;
                cursor: col-resize;
                z-index: 100;
            }

            .splitter > span {
                width: inherit;
                height: 100%;
                background: var(--highlight);
                position: relative;
            }

            .splitter > span:before,
            .splitter > span:after {
                content: '';
                position: absolute;
                background: var(--highlight);
                width: 2px;
                height: 1rem;
                top: 0;
                bottom: 0;
                margin: auto;
            }

            .splitter > span:after {
                right: 0.3rem;
            }
            .splitter > span:before {
                left: 0.3rem;
            }

            @media only screen and (max-width: 1000px) {

                .splitter {
                    width: 100%;
                    height: 4px;
                    padding: 1rem 0;
                    cursor: row-resize;
                }

                .splitter > span {
                    width: 100%;
                    height: inherit;
                }
                .splitter > span:after,
                .splitter > span:before {
                    width: 1rem;
                    height: 2px;
                    left: 0;
                    right: 0;
                }

                .splitter > span:after {
                    bottom: 0.3rem;
                }
                .splitter > span:before {
                    top: 0.3rem;
                }
            }
        `;
    }
}

if (!customElements.get("devtools-divider")) {
    customElements.define("devtools-divider", DevToolsDivider);
}
