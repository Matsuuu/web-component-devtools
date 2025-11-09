import "./style.css";
import "./web-awesome";
import "./panel";
import { initConnections } from "./devtools-connections";
import { createDevtoolsHoverLeaveEvent } from "./events/devtools-hover-event";
import { LogLevel, setLogLevel } from "@src/lib/logger/log";

document.addEventListener("mouseleave", () => {
    createDevtoolsHoverLeaveEvent();
});

// TODO: Some kind of dev flag?
setLogLevel(LogLevel.DEBUG);

initConnections();
