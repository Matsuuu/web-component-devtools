function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _decorate(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }

function _getDecoratorsApi() { _getDecoratorsApi = function () { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function (O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function (F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function (receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function (elements, decorators) { var newElements = []; var finishers = []; var placements = { static: [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function (element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function (element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function (elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function (element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function (elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function (elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function (elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function (elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function (obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function (constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function (obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }

function _createElementDescriptor(def) { var key = _toPropertyKey(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def.static ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }

function _coalesceGetterSetter(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }

function _coalesceClassElements(elements) { var newElements = []; var isSameElement = function (other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) { if (_hasDecorators(element) || _hasDecorators(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators(element)) { if (_hasDecorators(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter(element, other); } } else { newElements.push(element); } } return newElements; }

function _hasDecorators(element) { return element.decorators && element.decorators.length; }

function _isDataDescriptor(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }

function _optionalCallableProperty(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { ReactiveElement } from '../../reactive-element.js';
import { property } from '../../decorators/property.js';
import { generateElementName } from '../test-helpers.js';
import { assert } from '@esm-bundle/chai';
suite('@property', () => {
  let container;
  setup(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });
  teardown(() => {
    if (container !== undefined) {
      container.parentElement.removeChild(container);
      container = undefined;
    }
  });
  test('property options via decorator', async () => {
    const hasChanged = (value, old) => old === undefined || value > old;

    const fromAttribute = value => parseInt(value);

    const toAttribute = value => `${value}-attr`;

    let E = _decorate(null, function (_initialize, _ReactiveElement) {
      class E extends _ReactiveElement {
        constructor(...args) {
          super(...args);

          _initialize(this);
        }

      }

      return {
        F: E,
        d: [{
          kind: "field",
          decorators: [property({
            attribute: false
          })],
          key: "noAttr",

          value() {
            return 'noAttr';
          }

        }, {
          kind: "field",
          decorators: [property({
            attribute: true
          })],
          key: "atTr",

          value() {
            return 'attr';
          }

        }, {
          kind: "field",
          decorators: [property({
            attribute: 'custom',
            reflect: true
          })],
          key: "customAttr",

          value() {
            return 'customAttr';
          }

        }, {
          kind: "field",
          decorators: [property({
            hasChanged
          })],
          key: "hasChanged",

          value() {
            return 10;
          }

        }, {
          kind: "field",
          decorators: [property({
            converter: fromAttribute
          })],
          key: "fromAttribute",

          value() {
            return 1;
          }

        }, {
          kind: "field",
          decorators: [property({
            reflect: true,
            converter: {
              toAttribute
            }
          })],
          key: "toAttribute",

          value() {
            return 1;
          }

        }, {
          kind: "field",
          decorators: [property({
            attribute: 'all-attr',
            hasChanged,
            converter: {
              fromAttribute,
              toAttribute
            },
            reflect: true
          })],
          key: "all",

          value() {
            return 10;
          }

        }, {
          kind: "field",
          key: "updateCount",

          value() {
            return 0;
          }

        }, {
          kind: "method",
          key: "update",
          value: function update(changed) {
            this.updateCount++;

            _get(_getPrototypeOf(E.prototype), "update", this).call(this, changed);
          }
        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), E);
    const el = new E();
    container.appendChild(el);
    await el.updateComplete;
    assert.equal(el.updateCount, 1);
    assert.equal(el.noAttr, 'noAttr');
    assert.equal(el.atTr, 'attr');
    assert.equal(el.customAttr, 'customAttr');
    assert.equal(el.hasChanged, 10);
    assert.equal(el.fromAttribute, 1);
    assert.equal(el.toAttribute, 1);
    assert.equal(el.getAttribute('toattribute'), '1-attr');
    assert.equal(el.all, 10);
    assert.equal(el.getAttribute('all-attr'), '10-attr');
    el.setAttribute('noattr', 'noAttr2');
    el.setAttribute('attr', 'attr2');
    el.setAttribute('custom', 'customAttr2');
    el.setAttribute('fromattribute', '2attr');
    el.toAttribute = 2;
    el.all = 5;
    await el.updateComplete;
    assert.equal(el.updateCount, 2);
    assert.equal(el.noAttr, 'noAttr');
    assert.equal(el.atTr, 'attr2');
    assert.equal(el.customAttr, 'customAttr2');
    assert.equal(el.fromAttribute, 2);
    assert.equal(el.toAttribute, 2);
    assert.equal(el.getAttribute('toattribute'), '2-attr');
    assert.equal(el.all, 5);
    el.all = 15;
    await el.updateComplete;
    assert.equal(el.updateCount, 3);
    assert.equal(el.all, 15);
    assert.equal(el.getAttribute('all-attr'), '15-attr');
    el.setAttribute('all-attr', '16-attr');
    await el.updateComplete;
    assert.equal(el.updateCount, 4);
    assert.equal(el.getAttribute('all-attr'), '16-attr');
    assert.equal(el.all, 16);
    el.hasChanged = 5;
    await el.updateComplete;
    assert.equal(el.hasChanged, 5);
    assert.equal(el.updateCount, 4);
    el.hasChanged = 15;
    await el.updateComplete;
    assert.equal(el.hasChanged, 15);
    assert.equal(el.updateCount, 5);
    el.setAttribute('all-attr', '5-attr');
    await el.updateComplete;
    assert.equal(el.all, 5);
    assert.equal(el.updateCount, 5);
    el.all = 15;
    await el.updateComplete;
    assert.equal(el.all, 15);
    assert.equal(el.updateCount, 6);
  });
  test('can decorate user accessor with @property', async () => {
    let E = _decorate(null, function (_initialize2, _ReactiveElement2) {
      class E extends _ReactiveElement2 {
        constructor(...args) {
          super(...args);

          _initialize2(this);
        }

      }

      return {
        F: E,
        d: [{
          kind: "field",
          key: "_foo",
          value: void 0
        }, {
          kind: "field",
          key: "updatedContent",
          value: void 0
        }, {
          kind: "get",
          decorators: [property({
            reflect: true,
            type: Number
          })],
          key: "foo",
          value: function foo() {
            return this._foo;
          }
        }, {
          kind: "set",
          key: "foo",
          value: function foo(v) {
            const old = this.foo;
            this._foo = v;
            this.requestUpdate('foo', old);
          }
        }, {
          kind: "method",
          key: "updated",
          value: function updated() {
            this.updatedContent = this.foo;
          }
        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), E);
    const el = new E();
    container.appendChild(el);
    await el.updateComplete;
    assert.equal(el._foo, undefined);
    assert.equal(el.updatedContent, undefined);
    assert.isFalse(el.hasAttribute('foo'));
    el.foo = 5;
    await el.updateComplete;
    assert.equal(el._foo, 5);
    assert.equal(el.updatedContent, 5);
    assert.equal(el.getAttribute('foo'), '5');
  });
  test('can mix property options via decorator and via getter', async () => {
    const hasChanged = (value, old) => old === undefined || value > old;

    const fromAttribute = value => parseInt(value);

    const toAttribute = value => `${value}-attr`;

    let E = _decorate(null, function (_initialize3, _ReactiveElement3) {
      class E extends _ReactiveElement3 {
        constructor() {
          super();

          _initialize3(this);

          this.noAttr = 'noAttr';
          this.atTr = 'attr';
          this.customAttr = 'customAttr';
        }

      }

      return {
        F: E,
        d: [{
          kind: "field",
          decorators: [property({
            hasChanged
          })],
          key: "hasChanged",

          value() {
            return 10;
          }

        }, {
          kind: "field",
          decorators: [property({
            converter: fromAttribute
          })],
          key: "fromAttribute",

          value() {
            return 1;
          }

        }, {
          kind: "field",
          decorators: [property({
            reflect: true,
            converter: {
              toAttribute
            }
          })],
          key: "toAttribute",

          value() {
            return 1;
          }

        }, {
          kind: "field",
          decorators: [property({
            attribute: 'all-attr',
            hasChanged,
            converter: {
              fromAttribute,
              toAttribute
            },
            reflect: true
          })],
          key: "all",

          value() {
            return 10;
          }

        }, {
          kind: "field",
          key: "updateCount",

          value() {
            return 0;
          }

        }, {
          kind: "get",
          static: true,
          key: "properties",
          value: function properties() {
            return {
              noAttr: {
                attribute: false
              },
              atTr: {
                attribute: true
              },
              customAttr: {
                attribute: 'custom',
                reflect: true
              }
            };
          }
        }, {
          kind: "field",
          key: "noAttr",
          value: void 0
        }, {
          kind: "field",
          key: "atTr",
          value: void 0
        }, {
          kind: "field",
          key: "customAttr",
          value: void 0
        }, {
          kind: "method",
          key: "update",
          value: function update(changed) {
            this.updateCount++;

            _get(_getPrototypeOf(E.prototype), "update", this).call(this, changed);
          }
        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), E);
    const el = new E();
    container.appendChild(el);
    await el.updateComplete;
    assert.equal(el.updateCount, 1);
    assert.equal(el.noAttr, 'noAttr');
    assert.equal(el.atTr, 'attr');
    assert.equal(el.customAttr, 'customAttr');
    assert.equal(el.hasChanged, 10);
    assert.equal(el.fromAttribute, 1);
    assert.equal(el.toAttribute, 1);
    assert.equal(el.getAttribute('toattribute'), '1-attr');
    assert.equal(el.all, 10);
    assert.equal(el.getAttribute('all-attr'), '10-attr');
    el.setAttribute('noattr', 'noAttr2');
    el.setAttribute('attr', 'attr2');
    el.setAttribute('custom', 'customAttr2');
    el.setAttribute('fromattribute', '2attr');
    el.toAttribute = 2;
    el.all = 5;
    await el.updateComplete;
    assert.equal(el.updateCount, 2);
    assert.equal(el.noAttr, 'noAttr');
    assert.equal(el.atTr, 'attr2');
    assert.equal(el.customAttr, 'customAttr2');
    assert.equal(el.fromAttribute, 2);
    assert.equal(el.toAttribute, 2);
    assert.equal(el.getAttribute('toattribute'), '2-attr');
    assert.equal(el.all, 5);
    el.all = 15;
    await el.updateComplete;
    assert.equal(el.updateCount, 3);
    assert.equal(el.all, 15);
    assert.equal(el.getAttribute('all-attr'), '15-attr');
    el.setAttribute('all-attr', '16-attr');
    await el.updateComplete;
    assert.equal(el.updateCount, 4);
    assert.equal(el.getAttribute('all-attr'), '16-attr');
    assert.equal(el.all, 16);
    el.hasChanged = 5;
    await el.updateComplete;
    assert.equal(el.hasChanged, 5);
    assert.equal(el.updateCount, 4);
    el.hasChanged = 15;
    await el.updateComplete;
    assert.equal(el.hasChanged, 15);
    assert.equal(el.updateCount, 5);
    el.setAttribute('all-attr', '5-attr');
    await el.updateComplete;
    assert.equal(el.all, 5);
    assert.equal(el.updateCount, 5);
    el.all = 15;
    await el.updateComplete;
    assert.equal(el.all, 15);
    assert.equal(el.updateCount, 6);
  });
  test('property options via decorator do not modify superclass', async () => {
    class E extends ReactiveElement {
      static get properties() {
        return {
          foo: {
            type: Number,
            reflect: true
          }
        };
      }

      constructor() {
        super(); // Avoiding class fields for Babel compat.

        this.foo = 1;
      }

    }

    customElements.define(generateElementName(), E); // Note, this forces `E` to finalize

    const el1 = new E();

    let F = _decorate(null, function (_initialize4, _E) {
      class F extends _E {
        constructor(...args) {
          super(...args);

          _initialize4(this);
        }

      }

      return {
        F: F,
        d: [{
          kind: "field",
          decorators: [property({
            type: Number
          })],
          key: "foo",

          value() {
            return 2;
          }

        }]
      };
    }, E);

    customElements.define(generateElementName(), F);
    const el2 = new E();
    const el3 = new F();
    container.appendChild(el1);
    container.appendChild(el2);
    container.appendChild(el3);
    await el1.updateComplete;
    await el2.updateComplete;
    await el3.updateComplete;
    assert.isTrue(el1.hasAttribute('foo'));
    assert.isTrue(el2.hasAttribute('foo'));
    assert.isFalse(el3.hasAttribute('foo'));
  });
  test('can mix properties superclass with decorator on subclass', async () => {
    class E extends ReactiveElement {
      static get properties() {
        return {
          foo: {}
        };
      }

      constructor() {
        super(); // Avoiding class fields for Babel compat.

        _defineProperty(this, "foo", void 0);

        this.foo = 'foo';
      }

    }

    let F = _decorate(null, function (_initialize5, _E2) {
      class F extends _E2 {
        constructor(...args) {
          super(...args);

          _initialize5(this);
        }

      }

      return {
        F: F,
        d: [{
          kind: "field",
          decorators: [property()],
          key: "bar",

          value() {
            return 'bar';
          }

        }]
      };
    }, E);

    customElements.define(generateElementName(), F);
    const el = new F();
    container.appendChild(el);
    await el.updateComplete;
    el.setAttribute('foo', 'foo2');
    el.setAttribute('bar', 'bar2');
    await el.updateComplete;
    assert.equal(el.foo, 'foo2');
    assert.equal(el.bar, 'bar2');
  });
  test('can customize property options', async () => {
    const myProperty = options => property(options);

    let E = _decorate(null, function (_initialize6, _ReactiveElement4) {
      class E extends _ReactiveElement4 {
        // provide custom deorator expecting extended type
        // use regular decorator and cast to type
        constructor() {
          super(); // Avoiding class fields for Babel compat.

          _initialize6(this);

          this.zot2 = '';
          this.foo2 = 5;
        } // custom typed properties


      }

      return {
        F: E,
        d: [{
          kind: "method",
          static: true,
          key: "getPropertyDescriptor",
          value: function getPropertyDescriptor(name, key, options) {
            const defaultDescriptor = _get(_getPrototypeOf(E), "getPropertyDescriptor", this).call(this, name, key, options);

            return {
              get: defaultDescriptor.get,

              set(value) {
                const oldValue = this[name];

                if (options.validator) {
                  value = options.validator(value);
                }

                this[key] = value;
                this.requestUpdate(name, oldValue);
              },

              configurable: defaultDescriptor.configurable,
              enumerable: defaultDescriptor.enumerable
            };
          }
        }, {
          kind: "method",
          key: "updated",
          value: function updated(changedProperties) {
            _get(_getPrototypeOf(E.prototype), "updated", this).call(this, changedProperties);

            changedProperties.forEach((value, key) => {
              const options = this.constructor.getPropertyOptions(key);
              const observer = options.observer;

              if (typeof observer === 'function') {
                observer.call(this, value);
              }
            });
          }
        }, {
          kind: "field",
          decorators: [myProperty({
            type: Number,
            validator: value => Math.min(10, Math.max(value, 0))
          })],
          key: "foo",

          value() {
            return 5;
          }

        }, {
          kind: "field",
          decorators: [property({})],
          key: "bar",

          value() {
            return 'bar';
          }

        }, {
          kind: "field",
          key: "_observedZot",
          value: void 0
        }, {
          kind: "field",
          key: "_observedZot2",
          value: void 0
        }, {
          kind: "field",
          decorators: [property({
            observer: function (oldValue) {
              this._observedZot = {
                value: this.zot,
                oldValue
              };
            }
          })],
          key: "zot",

          value() {
            return '';
          }

        }, {
          kind: "get",
          static: true,
          key: "properties",
          value: function properties() {
            return {
              // object cast as type
              zot2: {
                observer: function (oldValue) {
                  this._observedZot2 = {
                    value: this.zot2,
                    oldValue
                  };
                }
              },
              // object satisfying defined custom type.
              foo2: {
                type: Number,
                validator: value => Math.min(10, Math.max(value, 0))
              }
            };
          }
        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), E);
    const el = new E();
    container.appendChild(el);
    await el.updateComplete;
    el.foo = 20;
    el.foo2 = 20;
    assert.equal(el.foo, 10);
    assert.equal(el.foo2, 10);
    assert.deepEqual(el._observedZot, {
      value: '',
      oldValue: undefined
    });
    assert.deepEqual(el._observedZot2, {
      value: '',
      oldValue: undefined
    });
    el.foo = -5;
    el.foo2 = -5;
    assert.equal(el.foo, 0);
    assert.equal(el.foo2, 0);
    el.bar = 'bar2';
    assert.equal(el.bar, 'bar2');
    el.zot = 'zot';
    el.zot2 = 'zot';
    await el.updateComplete;
    assert.deepEqual(el._observedZot, {
      value: 'zot',
      oldValue: ''
    });
    assert.deepEqual(el._observedZot2, {
      value: 'zot',
      oldValue: ''
    });
  });
});