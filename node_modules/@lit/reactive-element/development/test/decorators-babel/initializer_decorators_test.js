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

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { ReactiveElement } from '../../reactive-element.js';
import { generateElementName } from '../test-helpers.js';
import { decorateProperty } from '../../decorators/base.js';
import { assert } from '@esm-bundle/chai';
import { property } from '../../decorators/property.js';
suite('Decorators using initializers', () => {
  let container;
  setup(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  teardown(() => {
    container.parentElement.removeChild(container);
  });
  test('can create initializer decorator with `decorateProperty`', async () => {
    const wasDecorated = value => decorateProperty({
      finisher: (ctor, name) => {
        ctor.addInitializer(e => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          e.decoration = {
            name,
            value
          };
        });
      }
    });

    let A = _decorate(null, function (_initialize, _ReactiveElement) {
      class A extends _ReactiveElement {
        constructor(...args) {
          super(...args);

          _initialize(this);
        }

      }

      return {
        F: A,
        d: [{
          kind: "field",
          decorators: [wasDecorated('bar')],
          key: "foo",
          value: void 0
        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), A);
    const el = new A();
    container.appendChild(el); // eslint-disable-next-line @typescript-eslint/no-explicit-any

    assert.deepEqual(el.decoration, {
      name: 'foo',
      value: 'bar'
    });
  });
  test('can create `listen` controller decorator', async () => {
    const listeners = new WeakMap();

    const listenWindow = type => {
      return decorateProperty({
        finisher: (ctor, name) => {
          ctor.addInitializer(e => {
            const listener = event => ctor.prototype[name].call(e, event);

            let l = listeners.get(e);

            if (l === undefined) {
              listeners.set(e, l = []);
              e.addController({
                hostConnected() {
                  l.forEach(info => {
                    window.addEventListener(info.type, info.listener);
                  });
                },

                hostDisconnected() {
                  l.forEach(info => {
                    window.removeEventListener(info.type, info.listener);
                  });
                }

              });
            }

            l.push({
              type,
              listener
            });
          });
        }
      });
    };

    let B = _decorate(null, function (_initialize2, _ReactiveElement2) {
      class B extends _ReactiveElement2 {
        constructor(...args) {
          super(...args);

          _initialize2(this);
        }

      }

      return {
        F: B,
        d: [{
          kind: "method",
          decorators: [listenWindow('nug')],
          key: "eventHandler1",
          value: function eventHandler1(e) {
            this.event1 = e.type;
          }
        }, {
          kind: "method",
          decorators: [listenWindow('zug')],
          key: "eventHandler2",
          value: function eventHandler2(e) {
            this.event2 = e.type;
          }
        }, {
          kind: "field",
          key: "event1",
          value: void 0
        }, {
          kind: "field",
          key: "event2",
          value: void 0
        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), B);
    const el = new B();
    container.appendChild(el);
    document.body.dispatchEvent(new Event('nug', {
      bubbles: true
    }));
    document.body.dispatchEvent(new Event('zug', {
      bubbles: true
    }));
    assert.equal(el.event1, 'nug');
    assert.equal(el.event2, 'zug');
    el.event1 = undefined;
    el.event2 = undefined;
    container.removeChild(el);
    document.body.dispatchEvent(new Event('nug', {
      bubbles: true
    }));
    document.body.dispatchEvent(new Event('zug', {
      bubbles: true
    }));
    assert.isUndefined(el.event1);
    assert.isUndefined(el.event2);
  });
  test('can create `validate` controller decorator', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validators = new WeakMap();

    const validate = validatorFn => {
      return decorateProperty({
        finisher: (ctor, name) => {
          ctor.addInitializer(e => {
            let v = validators.get(e);

            if (v === undefined) {
              validators.set(e, v = []);
              e.addController({
                hostUpdate() {
                  v.forEach(({
                    key,
                    validator
                  }) => {
                    e[key] = validator(e[key]);
                  });
                }

              });
            }

            v.push({
              key: name,
              validator: validatorFn
            });
          });
        }
      });
    };

    let B = _decorate(null, function (_initialize3, _ReactiveElement3) {
      class B extends _ReactiveElement3 {
        constructor(...args) {
          super(...args);

          _initialize3(this);
        }

      }

      return {
        F: B,
        d: [{
          kind: "field",
          decorators: [property(), validate(v => Math.max(0, Math.min(10, v)))],
          key: "foo",

          value() {
            return 5;
          }

        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), B);
    const el = new B();
    container.appendChild(el);
    await el.updateComplete;
    assert.equal(el.foo, 5);
    el.foo = 100;
    await el.updateComplete;
    assert.equal(el.foo, 10);
    el.foo = -100;
    await el.updateComplete;
    assert.equal(el.foo, 0);
  });
  test('can create `observer` controller decorator', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const observers = new WeakMap();

    const observer = observerFn => {
      return decorateProperty({
        finisher: (ctor, name) => {
          ctor.addInitializer(e => {
            let v = observers.get(e);

            if (v === undefined) {
              observers.set(e, v = []);
              e.addController({
                hostUpdated() {
                  v.forEach(info => {
                    const value = e[info.key]; // eslint-disable-next-line @typescript-eslint/no-explicit-any

                    const hasChanged = e.constructor.getPropertyOptions(name)?.hasChanged ?? Object.is;

                    if (hasChanged(value, info.previousValue)) {
                      info.observer.call(e, value, info.previousValue);
                      info.previousValue = value;
                    }
                  });
                }

              });
            }

            v.push({
              key: name,
              observer: observerFn
            });
          });
        }
      });
    };

    let B = _decorate(null, function (_initialize4, _ReactiveElement4) {
      class B extends _ReactiveElement4 {
        constructor(...args) {
          super(...args);

          _initialize4(this);
        }

      }

      return {
        F: B,
        d: [{
          kind: "field",
          decorators: [property(), observer(function (value, previous) {
            this._observedFoo = {
              value,
              previous
            };
          })],
          key: "foo",

          value() {
            return 5;
          }

        }, {
          kind: "field",
          key: "_observedFoo",
          value: void 0
        }, {
          kind: "field",
          decorators: [property(), observer(function (value, previous) {
            this._observedBar = {
              value,
              previous
            };
          })],
          key: "bar",

          value() {
            return 'bar';
          }

        }, {
          kind: "field",
          key: "_observedBar",
          value: void 0
        }]
      };
    }, ReactiveElement);

    customElements.define(generateElementName(), B);
    const el = new B();
    container.appendChild(el);
    await el.updateComplete;
    assert.deepEqual(el._observedFoo, {
      value: 5,
      previous: undefined
    });
    assert.deepEqual(el._observedBar, {
      value: 'bar',
      previous: undefined
    });
    el.foo = 100;
    el.bar = 'bar2';
    await el.updateComplete;
    assert.deepEqual(el._observedFoo, {
      value: 100,
      previous: 5
    });
    assert.deepEqual(el._observedBar, {
      value: 'bar2',
      previous: 'bar'
    });
  });
});