import { createElement, IconNode, Menu } from "lucide";

export const MenuIcon = createElement(Menu);

interface LucideIconOptions {
    size: number;
    slot?: string;
}

export function LucideIcon(icon: IconNode, options: LucideIconOptions = { size: 24, slot: "" }) {
    return createElement(icon, { width: `${options.size}px`, height: `${options.size}px`, slot: options.slot || "" });
}
