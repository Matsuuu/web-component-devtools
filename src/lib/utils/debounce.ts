export function debounce(callback: Function, wait: number = 200) {
    let timeoutId: number | null = null;
    let debounceCount = 0;
    return (...args: any[]) => {
        debounceCount++;
        window.clearTimeout(timeoutId!);

        if (debounceCount > 100) {
            // If we have a massive amount of debounced events,
            // we want to call the function after 100 bounces so that
            // it doesn't get completely held back.
            debounceCount = 0;
            callback(...args);
        }

        timeoutId = window.setTimeout(() => {
            debounceCount = 0;
            callback(...args);
        }, wait);
    };
}
