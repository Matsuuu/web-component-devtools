import { css, html, LitElement } from 'lit';
import 'playground-elements/playground-code-editor.js';
import gruvboxTheme from 'playground-elements/themes/gruvbox-dark.css.js';
import materialTheme from 'playground-elements/themes/material-darker.css.js';
import ttcnTheme from 'playground-elements/themes/ttcn.css.js';
import { isArrowUpOrDown, isConsoleClear, isConsoleSubmit, isSideArrow } from './util';

export class DevToolsConsole extends LitElement {
    static get properties() {
        return {
            editor: { type: Object },
            theme: { type: String },
            value: { type: String },
            commandHistory: { type: Array },
            historyIndex: { type: Number },
            currentCommandStore: { type: String },
        };
    }

    constructor() {
        super();
        /** @type { HTMLElement | undefined } */
        this.editor = undefined;
        this.theme = 'light';
        this.value = '';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentCommandStore = '';
    }

    firstUpdated() {
        window.requestAnimationFrame(() => {
            this.focusEditor();
        });
    }

    updated(_changedProperties) {
        this.editor = this.shadowRoot.querySelector('#main-editor');
        if (_changedProperties.has('value')) {
            this.editor.value = this.value;
        }

        // Hack until the value patch lands on playgrounds
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const histories = this.commandHistory;
                histories.forEach((hist, i) => {
                    const historyCodes = this.shadowRoot.querySelectorAll('.history-code-editor');
                    const historyResults = this.shadowRoot.querySelectorAll('.history-result-editor');

                    historyCodes[i].value = hist.code;
                    historyResults[i].value = this.getHistoryResultValue(hist);
                });
            });
        });
    }

    getHistoryResultValue(historyResult) {
        let returnVal = historyResult.returnValue;
        if (historyResult.error && historyResult.errorID === '_ERR_RUNTIME') {
            returnVal = historyResult.error;
        }

        if (typeof returnVal === 'object') {
            returnVal = JSON.stringify(returnVal, null, 2);
        }
        return returnVal !== null && returnVal !== undefined ? returnVal.toString() : 'undefined';
    }

    focusEditor() {
        // Quite hacky, maybe there's a better way?
        /** @type HTMLElement */ (this.editor.shadowRoot.querySelector('.CodeMirror-code')).focus();
    }

    addHistoryEntry(historyEntry) {
        this.commandHistory.push(historyEntry);
        this.requestUpdate();
    }

    /**
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
        // Herein lies the spaghetti monster.
        // Only the bravest of warriors can look into the eyes of the monster
        // without being lashed into a uncontrollable rage
        if (isConsoleSubmit(e)) {
            const consoleContent = this.editor.value;
            if (consoleContent.trim().length <= 0) return;

            const submitEvent = new CustomEvent('devtools-console-submit', { detail: { code: consoleContent } });
            const eventSuccess = this.dispatchEvent(submitEvent);
            if (eventSuccess) {
                this.editor.value = '';
            }
            this.historyIndex = -1;
        }
        if (isConsoleClear(e)) {
            this.commandHistory = [];
            this.requestUpdate();
            this.historyIndex = -1;
        }
        if (isArrowUpOrDown(e)) {
            const cm = this.editor._codemirror;
            const cursorPosition = cm.getCursor();
            const isArrowUp = e.key === 'ArrowUp';
            const isValidHistoryPress =
                cursorPosition.outside !== undefined || cursorPosition.line + cursorPosition.ch === 0;
            if (isArrowUp && isValidHistoryPress) {
                if (this.historyIndex === 0) return;

                if (this.historyIndex > 0) {
                    this.historyIndex -= 1;
                } else {
                    this.historyIndex = this.commandHistory.length - 1;
                }
            }
            if (!isArrowUp && isValidHistoryPress) {
                if (this.historyIndex < 0) return;
                // Is down
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex += 1;
                } else {
                    this.value = this.currentCommandStore;
                    this.historyIndex = -1;
                    return;
                }
            }
            if (this.historyIndex >= 0) {
                this.value = this.commandHistory[this.historyIndex].code;
                window.requestAnimationFrame(() => {
                    cm.focus();
                    cm.setCursor(cm.lineCount(), 0);
                });
            }
            // If arrows, ignore the rest of the handlers
            return;
        }
        if (isSideArrow(e)) return;

        let newStoreVal = this.editor.value;
        // Add the newly added char
        if (e.key && e.key.length === 1) {
            newStoreVal += e.key;
        }
        this.currentCommandStore = newStoreVal;
    }

    render() {
        return html`
            ${this.renderHistoryEntries()}
            <span>
                ${caret}
                <playground-code-editor
                    id="main-editor"
                    class="${this.theme === 'light' ? '' : 'playground-theme-gruvbox-dark'}"
                    type="js"
                    @keydown=${this.onKeyDown}
                >
                </playground-code-editor>
            </span>
            ${this.commandHistory.length <= 0
                ? html`
                      <p class="subtitle">
                          Press Ctrl + Enter (Cmd + Enter on OSX) to submit, Ctrl + L, (Cmd + K on OSX) to clear the
                          console
                      </p>
                      <p class="subtitle">
                          You can use <code>this</code> or <code>$0</code> to access the selected element.
                      </p>
                  `
                : ''}
        `;
    }

    renderHistoryEntries() {
        return this.commandHistory.map(historyEntry => {
            return html`
                <span>
                    ${caret}
                    <playground-code-editor
                        class="history-code-editor ${this.theme === 'light' ? '' : 'playground-theme-gruvbox-dark'}"
                        type="js"
                        value="${historyEntry.code}"
                        readonly
                    >
                    </playground-code-editor>
                </span>
                ${this.renderHistoryReturnValue(historyEntry)}
            `;
        });
    }

    renderHistoryReturnValue(historyEntry) {
        let resultType = 'js';
        if (historyEntry.error && historyEntry.errorID === '_ERR_IS_NODE') {
            resultType = 'html';
        }

        let themeClass = this.theme === 'light' ? '' : 'playground-theme-gruvbox-dark';
        if (this.theme === 'dark' && historyEntry.errorID === '_ERR_RUNTIME') {
            themeClass = 'playground-theme-material-darker';
        }
        const returnVal = this.getHistoryResultValue(historyEntry);

        return html`
            <span>
                ${resultCaret}
                <playground-code-editor
                    class="history-result-editor ${themeClass}"
                    type="${resultType}"
                    value="${returnVal}"
                    readonly
                >
                </playground-code-editor>
            </span>
        `;
    }

    static get styles() {
        return [
            gruvboxTheme,
            ttcnTheme,
            materialTheme,
            css`
                :host {
                    display: flex;
                    flex-direction: column;
                    --font-size: 12px;
                    font-size: var(--font-size);
                    position: relative;
                    width: 100%;
                }

                span {
                    display: flex;
                    width: 100%;
                }

                .command-history-entry {
                    display: flex;
                    flex-direction: column;
                }

                .history-command,
                .history-result {
                    margin: 0.25rem 2rem;
                }

                .subtitle {
                    margin: 0.6rem 0 0 1rem;
                    opacity: 0.6;
                    color: var(--paragraph-color);
                }

                svg {
                    width: calc(var(--font-size) * 0.7);
                    height: calc(var(--font-size) * 0.7);
                    margin-top: calc(var(--font-size) * 0.6);
                    margin-left: 0.25rem;
                    fill: #367cf1;
                    transform: rotate(-90deg);
                    transform-origin: center;
                }

                .result-caret {
                    fill: var(--highlight);
                    transform: rotate(90deg);
                }

                playground-code-editor {
                    height: fit-content;
                    width: 100%;
                    --playground-code-font-size: var(--font-size);
                }
            `,
        ];
    }
}

if (!customElements.get('devtools-console')) {
    customElements.define('devtools-console', DevToolsConsole);
}

const caret = html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 451.847 451.847">
    <path
        d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751   c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0   c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
    />
</svg>`;
const resultCaret = html`<svg class="result-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 451.847 451.847">
    <path
        d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751   c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0   c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
    />
</svg>`;
