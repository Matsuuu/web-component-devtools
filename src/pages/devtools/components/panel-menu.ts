import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Cog, IconNode, ListTree } from "lucide";
import { TABS } from "../lib/devool-tabs";

interface MenuItem {
    id: string;
    label: string;
    icon: IconNode;
}

const MENU_ITEMS: MenuItem[][] = [
    [
        {
            id: TABS.ELEMENTS,
            label: "Elements",
            icon: ListTree,
        },
    ],
    [
        {
            id: TABS.SETTINGS,
            label: "Settings",
            icon: Cog,
        },
    ],
];

@customElement("wcdt-panel-menu")
@withTailwind
export class PanelMenu extends LitElement {
    className = "flex flex-col border-gray-500 border-r-2 border-solid w-min h-full";

    @property({})
    activePanel = TABS.ELEMENTS;

    protected firstUpdated(): void {
        // TODO: Better way for this
        this.className.split(" ").forEach(sty => {
            this.classList.add(sty);
        });
    }

    setActivePanel(panel: string) {
        this.activePanel = panel;
    }

    selectedButtonStyles = "[&[selected]]:bg-orange-400 [&[selected]]:text-white";
    hoverButtonStyles = "hover:bg-orange-400 hover:text-white";

    render() {
        return html`
            ${MENU_ITEMS.map(
                itemGroup => html`
                    ${itemGroup.map(
                        item => html`
                            <button
                                @click=${() => this.setActivePanel(item.id)}
                                ?selected=${this.activePanel === item.id}
                                class="cursor-pointer px-2 py-2 ${this.selectedButtonStyles} ${this.hoverButtonStyles}"
                            >
                                ${LucideIcon(item.icon)}
                            </button>
                        `,
                    )}
                `,
            )}
        `;
    }
}
