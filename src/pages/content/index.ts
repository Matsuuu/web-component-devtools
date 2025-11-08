import { initConnection } from "./messaging/content-connection";

export function initContentScript() {
    initConnection();

    const div = document.createElement("div");
    div.id = "wcdt-storage";
    document.body.appendChild(div);

    div.setAttribute("data-wcdt-selected", "");
}

initContentScript();
