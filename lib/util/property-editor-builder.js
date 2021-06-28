import { html } from "lit";

/**
 * @param {any} prop
 * @param {String} propName
 * @param {any} value
 * @param {Function} [inputCallback]
 */
export function renderObjectProperty(prop, propName, value, inputCallback) {
    return html`
            <li>
                <devtools-object-input
                    .property=${prop}
                    .propName=${propName}
                    .object=${value}
                    @devtools-input=${e => inputCallback && inputCallback(prop, e.detail.value)}
                ></devtools-object-input>
            </li>
        `;
}

/**
 * @param {{value: Number;name: String;}} prop
 * @param {String} propName
 * @param {any} value
 * @param {Function} [inputCallback]
 */
export function renderNumberProperty(prop, propName, value, inputCallback) {
    return html`
            <li>
                <devtools-text-input
                    type="number"
                    label=${propName}
                    .value=${value ?? ''}
                    @devtools-input=${e => inputCallback && inputCallback(prop, e.detail.value)}
                ></devtools-text-input>
            </li>
        `;
}

/**
 * @param {{value: String;name: String;}} prop
 * @param {String} propName
 * @param {any} value
 * @param {Function} [inputCallback]
 */
export function renderStringProperty(prop, propName, value, inputCallback) {
    return html`
            <li>
                <devtools-text-input
                    label=${propName}
                    .value=${value ?? ''}
                    @devtools-input=${e => inputCallback && inputCallback(prop, e.detail.value)}
                ></devtools-text-input>
            </li>
        `;
}

/**
 * @param {{value: any;name: String;}} prop
 * @param {String} propName
 * @param {any} value
 * @param {Function} [inputCallback]
 */
export function renderBooleanProperty(prop, propName, value, inputCallback) {
    return html`
            <li>
                <devtools-checkbox
                    label=${propName}
                    ?checked=${value ?? false}
                    @devtools-input=${e => inputCallback && inputCallback(prop, e.detail.value)}
                ></devtools-checkbox>
            </li>
        `;
}
