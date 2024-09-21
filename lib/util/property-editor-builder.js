import { html } from "lit";

/**
 * @typedef InputOptions
 * @property {any} property
 * @property {String} propertyName
 * @property {any} value
 * @property {Function} [inputCallback]
 * @property {Array<String>} [propertyPath]
 * @param {any} options
 */

/**
 * @param {InputOptions} options
 * */
export function renderObjectProperty(options) {
    return html`
        <li>
            <devtools-object-input
                .property=${options.property}
                .propName=${options.propertyName}
                .object=${options.value}
                .propertyPath=${options.propertyPath ?? []}
                @devtools-input=${e => options.inputCallback && options.inputCallback(e.detail)}
            ></devtools-object-input>
        </li>
    `;
}

/**
 * @param {InputOptions} options
 */
export function renderNumberProperty(options) {
    return html`
        <li>
            <devtools-text-input
                inspector
                type="number"
                label=${options.propertyName}
                .property=${options.property}
                .value=${options.value ?? ""}
                .propertyPath=${options.propertyPath ?? []}
                @devtools-input=${e => options.inputCallback && options.inputCallback(e.detail)}
            ></devtools-text-input>
        </li>
    `;
}

/**
 * @param {InputOptions} options
 */
export function renderStringProperty(options) {
    return html`
        <li>
            <devtools-text-input
                inspector
                label=${options.propertyName}
                .property=${options.property}
                .value=${options.value ?? ""}
                .propertyPath=${options.propertyPath ?? []}
                @devtools-input=${e => options.inputCallback && options.inputCallback(e.detail)}
            ></devtools-text-input>
        </li>
    `;
}

/**
 * @param {InputOptions} options
 */
export function renderUndefinedProperty(options) {
    const isBool = typeof options.value === "boolean";
    const checkedStatus = isBool ? options.value : options.value != null;
    return html`
        <li>
            <devtools-combination-input
                label=${options.propertyName}
                .property=${options.property}
                ?checked=${checkedStatus}
                .value=${options.value ? (isBool ? "" : options.value) : ""}
                .propertyPath=${options.propertyPath ?? []}
                @devtools-input=${e => options.inputCallback && options.inputCallback(e.detail)}
            ></devtools-combination-input>
        </li>
    `;
}

/**
 * @param {InputOptions} options
 */
export function renderUnionProperty(options) {
    return html`
        <li>
            <devtools-union-input
                label=${options.propertyName}
                .property=${options.property}
                ?checked=${options.value != null}
                .value=${options.value ?? ""}
                .propertyPath=${options.propertyPath ?? []}
                @devtools-input=${e => options.inputCallback && options.inputCallback(e.detail)}
            ></devtools-union-input>
        </li>
    `;
}

/**
 * @param {InputOptions} options
 */
export function renderNoEditProperty(options) {
    return html`
        <li>
            <devtools-no-edit-property
                label=${options.propertyName}
                .property=${options.property}
                .value=${options.value ?? ""}
            ></devtools-no-edit-property>
        </li>
    `;
}

/**
 * @param {InputOptions} options
 */
export function renderBooleanProperty(options) {
    return html`
        <li>
            <devtools-checkbox
                label=${options.propertyName}
                .property=${options.property}
                ?checked=${options.value ?? false}
                .propertyPath=${options.propertyPath ?? []}
                @devtools-input=${e => options.inputCallback && options.inputCallback(e.detail)}
            ></devtools-checkbox>
        </li>
    `;
}
