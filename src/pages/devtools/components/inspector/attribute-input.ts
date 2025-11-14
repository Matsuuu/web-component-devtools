import { Attribute } from "@src/lib/analyzer/analyzed-element";
import { withTailwind } from "@src/lib/css/tailwind";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("attribute-input")
@withTailwind
export class AttributeInput extends LitElement {
    @property({ type: String, reflect: true })
    name = "";

    @property({ type: Object })
    attribute!: Attribute;

    @property({ type: Boolean, reflect: true })
    editing = false;

    _leaveListener = this.leaveEditListener.bind(this);

    enterEdit() {
        this.editing = true;

        document.addEventListener("click", this._leaveListener);
    }

    leaveEditListener(event: MouseEvent) {
        const clickedThisElement = event
            .composedPath()
            .filter(target => target instanceof Element)
            .some(elem => elem === this);
        if (!clickedThisElement) {
            this.editing = false;
            document.removeEventListener("click", this._leaveListener);
            this.onValueChange();
        }
    }

    handleKeypress(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            this.editing = false;
            this.onValueChange();
        }
    }

    onValueChange() {
        // TODO
        console.warn("[attribute-input]: onValueChange not implemented");
    }

    render() {
        if (!this.attribute) {
            return;
        }

        return html`<label class="flex gap-2 cursor-auto">
            <span class="text-orange-400">${this.name}:</span>
            ${this.editing
                ? html`
                      <wa-input @keydown=${this.handleKeypress} size="small" value="${this.attribute.value}"></wa-input>
                  `
                : html`<span class="truncate" @click=${this.enterEdit}>${this.attribute.value}</span>`}
        </label> `;
    }

    static styles = css`
        wa-input::part(base) {
            height: 1.6em;
            padding: 0 1ch;
        }

        wa-input::part(input) {
            field-sizing: content;
        }

        wa-input {
            font-size: 1em;
            --wa-panel-border-radius: var(--wa-border-radius-s);
            --wa-focus-ring: solid 0.0875rem #3e96ff;
        }
    `;
}
