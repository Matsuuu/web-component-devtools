declare global {
    interface Window {
        __WC_DEV_TOOLS_ROUTER_CONNECTION: chrome.runtime.Port;
    }
}

export { };
