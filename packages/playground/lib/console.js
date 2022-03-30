import { css, html, LitElement } from 'lit';
import 'playground-elements/playground-project.js';
import 'playground-elements/playground-code-editor.js';
import 'playground-elements/playground-file-editor.js';
import { PlaygroundCodeEditor } from 'playground-elements/playground-code-editor.js';
import gruvboxTheme from 'playground-elements/themes/gruvbox-dark.css.js';
import materialTheme from 'playground-elements/themes/material-darker.css.js';
import ttcnTheme from 'playground-elements/themes/ttcn.css.js';
import { isArrowUpOrDown, isConsoleClear, isConsoleSubmit, isEscape, isSelectAll, isSideArrow, raf } from './util';

export class DevToolsConsole extends LitElement {
    static get properties() {
        return {
            editor: { type: Object },
            theme: { type: String },
            value: { type: String },
            commandHistory: { type: Array },
            historyIndex: { type: Number },
            currentCommandStore: { type: String },
            previousCursorPosition: { type: Object },
        };
    }

    constructor() {
        super();
        /** @type PlaygroundCodeEditor */
        this.editor = undefined;
        this.theme = 'light';
        // Value is used to modify the value of the editor from the outside.
        // If you want to modify the current editor value, use this.editor.value instead.
        this.value = '';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentCommandStore = '';
        this.previousCursorPosition = { line: 0, ch: 0 };
    }

    firstUpdated() {
        window.requestAnimationFrame(() => {
            this.focusEditor();
        });
    }

    /**
     * @param {import('lit').PropertyValues} _changedProperties
     */
    async updated(_changedProperties) {
        await raf();
        /** @type PlaygroundCodeEditor */
        this.editor = this.shadowRoot.querySelector('#main-editor').shadowRoot.querySelector('playground-code-editor');
        if (_changedProperties.has('value')) {
            this.editor.value = this.value;
        }

        // Hack until the value patch lands on playgrounds
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const histories = this.commandHistory;
                histories.forEach((hist, i) => {
                    /** @type NodeListOf<PlaygroundCodeEditor> */
                    const historyCodes = this.shadowRoot.querySelectorAll('.history-code-editor');
                    /** @type NodeListOf<PlaygroundCodeEditor> */
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
        this._getCodeMirrorElement()?.focus();
    }

    /**
     * @returns {HTMLElement | undefined}
     */
    _getCodeMirrorElement() {
        return this.editor?.shadowRoot?.querySelector('.CodeMirror-code');
    }

    /**
     * @returns {import("codemirror").Editor | undefined}
     */
    _getCodeMirrorCodeInstance() {
        return this.editor?._codemirror;
    }

    _focusCorrectArea() {
        const instance = this._getCodeMirrorCodeInstance();
        instance.setCursor(instance.lineCount(), 0);
    }

    addHistoryEntry(historyEntry) {
        this.commandHistory.push(historyEntry);
        this.requestUpdate();
    }

    _getEditorValue() {
        const rawValue = this.editor.value;
        const actualValue = rawValue.substring(
            rawValue.indexOf('/* playground-hide-end */') + '/* playground-hide-end */'.length,
        );
        return actualValue;
    }

    _getHiddenContentLength() {
        if (!this.editor.value.includes("/* playground-hide-end */")) return 0;
        return this.editor.value.indexOf('/* playground-hide-end */') + '/* playground-hide-end */'.length
    }

    /**
        * As we have this kinda hacky hidden portion to get the context correct,
        * we want to make sure the user's cursor is at the end of the portion, 
        * so that the context is injected correctly.
        */
    correctCursorPosition() {
        if (this.editor.cursorIndex < this._getHiddenContentLength()) {
            this._focusCorrectArea();
        }
    }

    /**
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
        // Herein lies the spaghetti monster.
        // Only the bravest of warriors can look into the eyes of the monster
        // without being lashed into a uncontrollable rage
        if (isSelectAll(e)) {
            e.preventDefault();
            return;
        }
        this.correctCursorPosition();
        if (isConsoleSubmit(e)) {
            const consoleContent = this._getEditorValue().trim();
            if (consoleContent.length <= 0) return;

            const submitEvent = new CustomEvent('devtools-console-submit', { detail: { code: consoleContent } });
            const eventSuccess = this.dispatchEvent(submitEvent);
            if (eventSuccess) {
                this.editor.value = this._getEditorValueInjected() || '';
            }
            this.historyIndex = -1;
        }
        if (isConsoleClear(e)) {
            this.commandHistory = [];
            this.requestUpdate();
            this.historyIndex = -1;
        }
        if (isArrowUpOrDown(e)) {
            const cursorPosition = this.editor.cursorPosition;
            const isArrowUp = e.key === 'ArrowUp';
            const lineCount = (this.editor.value.match(/\n/g) || []).length;
            //const isValidHistoryUpPress = isArrowUp && cursorPosition?.line + cursorPosition.ch === 0;
            const isValidHistoryUpPress = isArrowUp && this.editor.cursorIndex <= this._getHiddenContentLength();
            const isValidHistoryDownPress =
                !isArrowUp &&
                lineCount === cursorPosition?.line &&
                this.previousCursorPosition.line === cursorPosition.line;

            if (isValidHistoryUpPress) {
                if (this.historyIndex === 0) return;

                if (this.historyIndex > 0) {
                    this.historyIndex -= 1;
                } else {
                    this.historyIndex = this.commandHistory.length - 1;
                }
            }
            if (isValidHistoryDownPress) {
                if (this.historyIndex < 0) return;
                // Is down
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex += 1;
                } else {
                    this.editor.value = this.currentCommandStore;
                    this.historyIndex = -1;
                    return;
                }
            }
            if (this.historyIndex >= 0) {
                this.editor.value = this.commandHistory[this.historyIndex].code;
                window.requestAnimationFrame(() => {
                    this.editor.focus();
                });
            }
            // If arrows, save the cursor position and ignore the rest of the handlers
            this.previousCursorPosition = this.editor.cursorPosition;
            return;
        }

        this.previousCursorPosition = this.editor.cursorPosition;

        if (isSideArrow(e)) return;

        // If we get here, we can trust it's an actual input
        let newStoreVal = this.editor.value;
        // Add the newly added char
        if (e.key && e.key.length === 1) {
            newStoreVal += e.key;
        }
        this.currentCommandStore = newStoreVal;
    }

    /**
     * Fetch all of class, but the last closing bracket, allowing us
     * to inject a context-aware function there so that we can access
     * the local variables.
     */
    _getEditorValueInjected() {
        return `/* playground-hide */${this.value.substring(
            0,
            this.value.lastIndexOf('}'),
        )}constructor() {/* playground-hide-end */`.trim();
    }

    render() {
        return html`
            ${this.renderHistoryEntries()}
            <span>
                ${caret}
                <playground-project id="console-project">
                    <script type="sample/ts" filename="index.ts">
                        ${this._getEditorValueInjected()}
                    </script>
                    <script filename="package.json" hidden>
                        {
                            "dependencies": {

                            }
                        }
                    </script>
                </playground-project>

                <playground-file-editor
                    id="main-editor"
                    project="console-project"
                    class="${this.theme === 'light' ? '' : 'playground-theme-gruvbox-dark'}"
                    type="ts"
                    @keydown=${this.onKeyDown}
                >
                </playground-file-editor>
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

    /**
     * @param {{ error: any; errorID: string; }} historyEntry
     */
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

                playground-code-editor,
                playground-file-editor {
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
