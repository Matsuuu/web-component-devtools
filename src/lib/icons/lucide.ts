import { createElement, IconNode, Menu } from "lucide";

export const MenuIcon = createElement(Menu);

export function LucideIcon(icon: IconNode, size: number = 24) {
    return createElement(icon, { width: `${size}px`, height: `${size}px` });
}
