import { sub } from "../util/messaging";
import "/lib/elements/custom-elements-list.js";
import "/lib/elements/custom-elements-inspector.js";
import { MESSAGE_TYPE } from "../types/message-types.js";

// Example of handling connections and messages on devtools side
/*sub("INIT", (port, message) => {
port.postMessage({ type: MESSAGE_TYPE.LOG, data: "Message recieved at init and returned to log" });
});*/
