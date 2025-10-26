import { withTailwind } from "@src/lib/css/tailwind";
import { LucideIcon } from "@src/lib/icons/lucide";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { Cog, IconNode, ListTree } from "lucide";

interface MenuItem {
  label: string;
  icon: IconNode;
}

const MENU_ITEMS: MenuItem[][] = [
  [
    {
      label: "Elements",
      icon: ListTree,
    },
  ],
  [
    {
      label: "Settings",
      icon: Cog,
    },
  ],
];

@customElement("wcdt-panel-menu")
@withTailwind
export class PanelMenu extends LitElement {
  className =
    "flex flex-col border-red-500 border-r-2 border-solid w-min h-full";

  protected firstUpdated(): void {
    // TODO: Better way for this
    this.className.split(" ").forEach((sty) => {
      this.classList.add(sty);
    });
  }

  render() {
    return html`
      ${MENU_ITEMS.map(
        (itemGroup) => html`
          ${itemGroup.map(
            (item) => html`
              <button class="cursor-pointer">${LucideIcon(item.icon)}</button>
            `,
          )}
        `,
      )}
    `;
  }
}
