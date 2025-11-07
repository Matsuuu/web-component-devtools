// @ts-ignore
import ts from "/ts.bundle.js";

/**
 * We pre-bundle the Typescript compiler so that we can easily use it in our project,
 * while also keeping our build times low.
 *
 * Everytime the Devtools needs to use the TS instance, it should be through this function
 * */
export function getTS(): typeof import("typescript") {
    return ts;
}
