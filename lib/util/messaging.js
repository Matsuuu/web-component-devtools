export function sub(callback) {
    chrome.runtime.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(message) {
            callback(port, message);
        });
    });
}
