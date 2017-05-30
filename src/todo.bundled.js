(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var AbstractComponent_1 = require("./src/AbstractComponent");
exports.AbstractComponent = AbstractComponent_1.AbstractComponent;
var AbstractElement_1 = require("./src/AbstractElement");
exports.AbstractElement = AbstractElement_1.AbstractElement;
var ComponentQueue_1 = require("./src/ComponentQueue");
exports.ComponentQueue = ComponentQueue_1.ComponentQueue;
var Binding_1 = require("./src/Binding");
exports.Binding = Binding_1.Binding;
exports.persist = Binding_1.persist;
exports.persistentModel = Binding_1.persistentModel;
exports.Persistence = Binding_1.Persistence;
exports.TwoWayBinding = Binding_1.TwoWayBinding;
var Collection_1 = require("./src/Collection");
exports.Collection = Collection_1.Collection;
var Component_1 = require("./src/Component");
exports.Component = Component_1.Component;
var FunctionalComponent_1 = require("./src/FunctionalComponent");
exports.FunctionalElement = FunctionalComponent_1.FunctionalElement;
var ModelArray_1 = require("./src/ModelArray");
exports.ModelArray = ModelArray_1.ModelArray;
var ModelObject_1 = require("./src/ModelObject");
exports.ModelObject = ModelObject_1.ModelObject;
var ModelCollection_1 = require("./src/ModelCollection");
exports.ModelCollection = ModelCollection_1.ModelCollection;
var ModelElement_1 = require("./src/ModelElement");
exports.ModelElement = ModelElement_1.ModelElement;
var SVGCollection_1 = require("./src/SVGCollection");
exports.SVGCollection = SVGCollection_1.SVGCollection;
var SVGComponent_1 = require("./src/SVGComponent");
exports.SVGComponent = SVGComponent_1.SVGComponent;

},{"./src/AbstractComponent":2,"./src/AbstractElement":3,"./src/Binding":4,"./src/Collection":5,"./src/Component":6,"./src/ComponentQueue":7,"./src/FunctionalComponent":8,"./src/ModelArray":9,"./src/ModelCollection":10,"./src/ModelElement":11,"./src/ModelObject":12,"./src/SVGCollection":13,"./src/SVGComponent":14}],2:[function(require,module,exports){
"use strict";
const Binding_1 = require("./Binding");
const AbstractElement_1 = require("./AbstractElement");
const ModelElement_1 = require("./ModelElement");
const ComponentQueue_1 = require("./ComponentQueue");
class AbstractComponent {
    constructor(tagName, parent, namespace) {
        this.destroyed = false;
        if (!namespace)
            this.element = window.document.createElement(tagName || "div");
        else
            this.element = window.document.createElementNS(namespace, tagName);
        if (parent != undefined) {
            this.parent = parent;
            parent.appendChild(this.element);
        }
        ComponentQueue_1.ComponentQueue.add(this);
    }
    getElement() {
        return this.element;
    }
    setElement(element) {
        this.element = element;
    }
    setParent(parent) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }
    reinit(immediate = false) {
        if (immediate) {
            this.updateClass();
            this.updateText();
            if (this.attrs) {
                for (let name in this.attrs) {
                    this.updateAttribute(name);
                }
            }
            this.updateValue();
        }
        else {
            ComponentQueue_1.ComponentQueue.add(this);
        }
    }
    _isDestroyed() {
        return this.destroyed;
    }
    _remove() {
        if (this.element.parentElement)
            this.element.parentElement.removeChild(this.element);
    }
    destroy() {
        this.destroyed = true;
        ComponentQueue_1.ComponentQueue.add(this);
    }
    withClass(...classes) {
        if (!this.classes)
            this.classes = new Set();
        for (let cls of classes) {
            this.classes.add(cls);
            if (cls instanceof AbstractElement_1.AbstractElement) {
                cls.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            }
            else if (cls instanceof Binding_1.Binding) {
                let binding = cls;
                binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            }
        }
        return this;
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof AbstractElement_1.AbstractElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.className = classNames.join(" ");
    }
    removeClass(...classes) {
        if (this.classes) {
            for (let cls of classes) {
                if (cls instanceof AbstractElement_1.AbstractElement) {
                    cls.unregisterCallback(this, this.updateClass.bind(this));
                }
                else if (cls instanceof Binding_1.Binding) {
                    let binding = cls;
                    binding.model.unregisterCallback(this, this.updateClass.bind(this));
                }
                this.classes.delete(cls);
            }
        }
        return this;
    }
    withText(text) {
        this.text = text;
        if (text instanceof AbstractElement_1.AbstractElement) {
            text.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        else if (this.text instanceof Binding_1.Binding) {
            let binding = text;
            binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        return this;
    }
    updateText() {
        if (this.text != undefined) {
            let text;
            if (typeof this.text == "string")
                text = this.text;
            else if (this.text instanceof AbstractElement_1.AbstractElement) {
                text = this.text.get();
            }
            else {
                let binding = this.text;
                text = binding.onupdate(binding.model.get());
            }
            this.element.textContent = text;
        }
    }
    removeText() {
        if (this.text != undefined) {
            if (this.text instanceof AbstractElement_1.AbstractElement)
                this.text.unregisterCallback(this, this.updateText.bind(this));
            else if (this.text instanceof Binding_1.Binding) {
                let binding = this.text;
                binding.model.unregisterCallback(this, this.updateText.bind(this));
            }
        }
        this.text = "";
        this.updateText();
        return this;
    }
    withValue(value) {
        this.value = value;
        let valueProp;
        function setInputType() {
            let inputType = this.element.getAttribute("type");
            valueProp = inputType == "checkbox" || inputType == "radio" ? "checked" : "value";
        }
        if (value instanceof ModelElement_1.ModelElement) {
            value.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            this.on("change", function () {
                setInputType.call(this);
                value.set(this.element[valueProp]);
            }.bind(this));
        }
        else if (this.value instanceof Binding_1.TwoWayBinding) {
            let binding = value;
            binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            this.on("change", function () {
                setInputType.call(this);
                binding.model.set(binding.onUserUpdate(this.element[valueProp]));
            }.bind(this));
        }
        return this;
    }
    removeValue() {
        if (this.value != undefined) {
            if (this.value instanceof AbstractElement_1.AbstractElement) {
                this.value.unregisterCallback(this, this.updateValue.bind(this));
            }
            else if (this.value instanceof Binding_1.Binding) {
                let binding = this.value;
                binding.model.unregisterCallback(this, this.updateValue.bind(this));
            }
        }
        let valueProp = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
        this.element[valueProp] = "";
        this.element.onchange = null;
        return this;
    }
    updateValue() {
        if (this.value != undefined) {
            let value;
            let valueProp = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
            if (!(typeof this.value == "object")) {
                value = this.value;
            }
            else if (this.value instanceof AbstractElement_1.AbstractElement) {
                value = this.value.get();
            }
            else {
                let binding = this.value;
                value = binding.onupdate(binding.model.get());
            }
            this.element[valueProp] = value;
        }
    }
    withAttribute(name, value) {
        if (!this.attrs)
            this.attrs = {};
        this.attrs[name] = value;
        if (value instanceof AbstractElement_1.AbstractElement) {
            value.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        else if (value instanceof Binding_1.Binding) {
            let binding = value;
            binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        return this;
    }
    removeAttribute(name) {
        if (this.attrs != undefined) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof AbstractElement_1.AbstractElement) {
                    value.unregisterCallback(this, this.updateAttribute.bind(this, name));
                }
                else {
                    let binding = value;
                    binding.model.unregisterCallback(this, this.updateAttribute.bind(this, name));
                }
                delete this.attrs[name];
                this.element.removeAttribute(name);
            }
        }
        return this;
    }
    updateAttribute(name) {
        if (this.attrs) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof AbstractElement_1.AbstractElement) {
                    value = value.get();
                }
                else if (value instanceof Binding_1.Binding) {
                    let binding = value;
                    value = binding.onupdate(binding.model.get());
                }
                this.element.setAttribute(name, value);
            }
        }
    }
    on(eventName, eventHandler) {
        this.element.addEventListener(eventName, (event) => {
            eventHandler.call(this, event);
            ComponentQueue_1.ComponentQueue.cycle();
        });
        return this;
    }
    off(eventName) {
        this.element.removeEventListener(eventName);
        return this;
    }
    focus() {
        this.element.focus();
        return this;
    }
    hide() {
        this.element.classList.add("hidden");
        return this;
    }
    show() {
        this.element.classList.remove("hidden");
        return this;
    }
}
exports.AbstractComponent = AbstractComponent;

},{"./AbstractElement":3,"./Binding":4,"./ComponentQueue":7,"./ModelElement":11}],3:[function(require,module,exports){
"use strict";
const ComponentQueue_1 = require("./ComponentQueue");
class AbstractElement {
    destroy() {
        if (!this.boundComponents)
            return;
        for (let component of this.boundComponents.values())
            component.destroy();
    }
    bindComponent(component) {
        if (!this.boundComponents) {
            this.boundComponents = new Set();
        }
        this.boundComponents.add(component);
    }
    registerCallback(component, updateCallback) {
        if (!this.updateCallbacks)
            this.updateCallbacks = new Map();
        let callbackSet = this.updateCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set();
            this.updateCallbacks.set(component, callbackSet);
        }
        callbackSet.add(updateCallback);
    }
    unregisterCallback(component, callback) {
        if (!this.updateCallbacks)
            return;
        if (!callback)
            this.updateCallbacks.delete(component);
        else if (this.updateCallbacks.has(component)) {
            let set = this.updateCallbacks.get(component);
            if (set)
                set.delete(callback);
        }
    }
    doUpdate() {
        if (!this.updateCallbacks)
            return;
        for (let callbackSet of this.updateCallbacks.values()) {
            for (let callback of callbackSet.values())
                callback(this.get());
        }
        for (let key of this.updateCallbacks.keys()) {
            if (ComponentQueue_1._instanceofQueableComponent(key))
                ComponentQueue_1.ComponentQueue.add(key);
        }
    }
}
exports.AbstractElement = AbstractElement;

},{"./ComponentQueue":7}],4:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("./ModelElement");
const ModelArray_1 = require("./ModelArray");
class Binding {
    constructor(model, onupdate) {
        this.model = model;
        this.onupdate = onupdate;
    }
}
exports.Binding = Binding;
class TwoWayBinding extends Binding {
    constructor(model, onModelUpdate, onUserUpdate) {
        super(model, onModelUpdate);
        this.onUserUpdate = onUserUpdate;
    }
}
exports.TwoWayBinding = TwoWayBinding;
class _Persistence {
    store() {
        window.sessionStorage.setItem("model", this.model.serialize());
    }
    get() {
        return window.sessionStorage.getItem("model");
    }
    hasModel() {
        return window.sessionStorage.getItem("model") != undefined;
    }
}
exports.Persistence = new _Persistence();
function makeModelPersistent() {
    for (let member in this) {
        if (this[member] instanceof ModelElement_1.ModelElement) {
            let modelElement = this[member];
            modelElement.set = function (a, b) {
                ModelElement_1.ModelElement.prototype.set.call(modelElement, a, b);
                exports.Persistence.store();
            };
        }
        if (this[member] instanceof ModelArray_1.ModelArray) {
            let modelArray = this[member];
            modelArray.add = function (a) {
                ModelArray_1.ModelArray.prototype.add.call(modelArray, a);
                exports.Persistence.store();
                return modelArray;
            };
            modelArray.remove = function (a) {
                ModelArray_1.ModelArray.prototype.remove.call(modelArray, a);
                exports.Persistence.store();
                return modelArray;
            };
        }
    }
}
function persistentModel(constructor) {
    return function (a, b, c, d, e, f) {
        exports.Persistence.emptyModel = constructor;
        let original;
        if (exports.Persistence.hasModel()) {
            original = constructor.prototype.deserialize(new exports.Persistence.emptyModel(), exports.Persistence.get());
        }
        else {
            original = new constructor(a, b, c, d, e, f);
        }
        Object.assign(this, original);
        this.__proto__ = original.__proto__;
        exports.Persistence.model = this;
        makeModelPersistent.call(this);
    };
}
exports.persistentModel = persistentModel;
function persist(constructor) {
    return function (a, b, c, d, e, f) {
        let original = new constructor(a, b, c, d, e, f);
        Object.assign(this, original);
        this.__proto__ = original["__proto__"];
        makeModelPersistent.call(this);
    };
}
exports.persist = persist;

},{"./ModelArray":9,"./ModelElement":11}],5:[function(require,module,exports){
"use strict";
const ModelArray_1 = require("./ModelArray");
const Component_1 = require("./Component");
class Collection extends Component_1.Component {
    children(model, onAddCallback) {
        model.registerAddCallback(this, function (newItem) {
            let i = model instanceof ModelArray_1.ModelArray ? model.size.get() : "";
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            this.child(newComponent);
        }.bind(this));
        return this;
    }
}
exports.Collection = Collection;

},{"./Component":6,"./ModelArray":9}],6:[function(require,module,exports){
"use strict";
const AbstractComponent_1 = require("./AbstractComponent");
const ComponentQueue_1 = require("./ComponentQueue");
class Component extends AbstractComponent_1.AbstractComponent {
    constructor() {
        super(...arguments);
        this.addedChildren = new Set();
    }
    child(x) {
        let components;
        if (x instanceof Array)
            components = x;
        else
            components = Array.prototype.slice.call(arguments);
        for (let component of components) {
            component.setParent(this);
            this.addedChildren.add(component);
        }
        ComponentQueue_1.ComponentQueue.add(this);
        return this;
    }
    reinit(immediate = false) {
        super.reinit(immediate);
        this.flushChildren();
    }
    flushChildren() {
        for (let child of this.addedChildren.values())
            this.element.appendChild(child.getElement());
        this.addedChildren.clear();
    }
}
exports.Component = Component;

},{"./AbstractComponent":2,"./ComponentQueue":7}],7:[function(require,module,exports){
"use strict";
function _instanceofQueableComponent(obj) {
    return 'getParent' in obj
        && '_isDestroyed' in obj
        && '_remove' in obj
        && 'reinit' in obj;
}
exports._instanceofQueableComponent = _instanceofQueableComponent;
class _ComponentQueue {
    constructor() {
        this.queue = new Set();
    }
    add(component) {
        this.queue.add(component);
        this.resolveAncestor(component);
    }
    cycle() {
        const queueToExecute = this.queue;
        this.queue = new Set();
        const cycleRootToExecute = this.cycleRoot;
        this.cycleRoot = null;
        if (queueToExecute.size == 0)
            return;
        let rootParent = cycleRootToExecute.getParent();
        let rootParentElement;
        if (rootParent instanceof Element)
            rootParentElement = rootParent;
        else
            rootParentElement = rootParent.getElement();
        var nextSibling = cycleRootToExecute.getElement().nextSibling;
        rootParentElement.removeChild(cycleRootToExecute.getElement());
        if (cycleRootToExecute._isDestroyed())
            return;
        for (let item of queueToExecute.values()) {
            if (_instanceofQueableComponent(item)) {
                let component = item;
                if (component._isDestroyed())
                    component._remove();
                else
                    component.reinit(true);
            }
            else {
                let element = item;
                element.doUpdate();
            }
        }
        if (nextSibling)
            rootParentElement.insertBefore(cycleRootToExecute.getElement(), nextSibling);
        else
            rootParentElement.appendChild(cycleRootToExecute.getElement());
    }
    resolveAncestor(other) {
        if (!this.cycleRoot) {
            this.cycleRoot = other;
            return;
        }
        let ancestor = other;
        while (ancestor && !(ancestor instanceof Element) &&
            (ancestor = ancestor.getParent())) {
            if (ancestor === this.cycleRoot)
                return;
        }
        this.cycleRoot = other;
    }
}
exports._ComponentQueue = _ComponentQueue;
exports.ComponentQueue = new _ComponentQueue();

},{}],8:[function(require,module,exports){
"use strict";
const AbstractElement_1 = require("./AbstractElement");
class FunctionalElement extends AbstractElement_1.AbstractElement {
    constructor(handler, ...listenedTo) {
        super();
        this.handler = handler;
        this.listenedTo = listenedTo || [];
        for (let model of this.listenedTo)
            model.registerCallback(model, this.doUpdate.bind(this));
    }
    get() {
        return this.handler.apply(this.handler, this.listenedTo.map(function (model) {
            return model.get();
        }));
    }
    subscribe(remoteStream) {
        throw "Not implemented";
    }
}
exports.FunctionalElement = FunctionalElement;

},{"./AbstractElement":3}],9:[function(require,module,exports){
"use strict";
const ModelCollection_1 = require("./ModelCollection");
const ModelElement_1 = require("./ModelElement");
class ModelArray extends ModelCollection_1.ModelCollection {
    constructor(data) {
        super([]);
        this.size = new ModelElement_1.ModelElement(0);
        if (data) {
            for (let item of data) {
                this.add(item);
            }
        }
    }
    add(member) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let newMember = new ModelElement_1.ModelElement(member);
        this.data.push(newMember);
        const index = this.data.length - 1;
        for (let callbackSet of this.addCallbacks.values()) {
            for (let callback of callbackSet.values()) {
                callback(newMember, index);
            }
        }
        this.size.set(this.size.get() + 1);
        return this;
    }
    remove(member) {
        let index = this.data.indexOf(member);
        if (index !== -1) {
            member.destroy();
            this.data.splice(index, 1);
        }
        this.size.set(this.size.get() - 1);
        return this;
    }
    clear() {
        while (this.data.length > 0)
            this.remove(this.data[0]);
        return this;
    }
    subscribe(remoteStream) {
        throw "Not implemented";
    }
}
exports.ModelArray = ModelArray;

},{"./ModelCollection":10,"./ModelElement":11}],10:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("./ModelElement");
class ModelCollection extends ModelElement_1.ModelElement {
    registerAddCallback(component, addCallback) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let callbackSet = this.addCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set();
            this.addCallbacks.set(component, callbackSet);
        }
        callbackSet.add(addCallback);
    }
    unregisterCallback(component, callback) {
        if (!this.addCallbacks)
            return;
        if (!callback)
            this.addCallbacks.delete(component);
        else if (this.addCallbacks.has(component)) {
            let set = this.addCallbacks.get(component);
            if (set)
                set.delete(callback);
        }
    }
}
exports.ModelCollection = ModelCollection;

},{"./ModelElement":11}],11:[function(require,module,exports){
"use strict";
const AbstractElement_1 = require("./AbstractElement");
class ModelElement extends AbstractElement_1.AbstractElement {
    constructor(data) {
        super();
        this.data = data;
    }
    get() {
        return this.data;
    }
    set(data, doUpdate = true) {
        this.data = data;
        if (doUpdate)
            this.doUpdate();
    }
    subscribe(remoteStream) {
        throw "Not Implemented";
    }
}
exports.ModelElement = ModelElement;

},{"./AbstractElement":3}],12:[function(require,module,exports){
"use strict";
const ModelCollection_1 = require("./ModelCollection");
const ModelElement_1 = require("./ModelElement");
class ModelObject extends ModelCollection_1.ModelCollection {
    constructor(obj) {
        super({});
        for (let k in obj) {
            this.put(k, obj[k]);
        }
    }
    put(key, member) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let newMember = new ModelElement_1.ModelElement(member);
        this.data[key] = newMember;
        for (let callbackSet of this.addCallbacks.values()) {
            for (let callback of callbackSet.values()) {
                callback(newMember, key);
            }
        }
        return this;
    }
    remove(member) {
        for (let key in this.data) {
            let item = this.data[key];
            if (member === item) {
                delete this.data[key];
                member.destroy();
            }
        }
        return this;
    }
}
exports.ModelObject = ModelObject;

},{"./ModelCollection":10,"./ModelElement":11}],13:[function(require,module,exports){
"use strict";
const Collection_1 = require("./Collection");
const ModelElement_1 = require("./ModelElement");
class SVGCollection extends Collection_1.Collection {
    constructor(tagName, parent) {
        super(tagName, parent, "http://www.w3.org/2000/svg");
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof ModelElement_1.ModelElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.setAttribute("class", classNames.join(" "));
    }
    withWidth(width) {
        return this.withAttribute("width", width);
    }
    withHeight(height) {
        return this.withAttribute("height", height);
    }
    withX(x) {
        return this.withAttribute("x", x);
    }
    withY(y) {
        return this.withAttribute("y", y);
    }
}
exports.SVGCollection = SVGCollection;

},{"./Collection":5,"./ModelElement":11}],14:[function(require,module,exports){
"use strict";
const Component_1 = require("./Component");
const ModelElement_1 = require("./ModelElement");
class SVGComponent extends Component_1.Component {
    constructor(tagName, parent) {
        super(tagName, parent, "http://www.w3.org/2000/svg");
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof ModelElement_1.ModelElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.setAttribute("class", classNames.join(" "));
    }
    withWidth(width) {
        return this.withAttribute("width", width);
    }
    withHeight(height) {
        return this.withAttribute("height", height);
    }
    withX(x) {
        return this.withAttribute("x", x);
    }
    withY(y) {
        return this.withAttribute("y", y);
    }
}
exports.SVGComponent = SVGComponent;

},{"./Component":6,"./ModelElement":11}],15:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const tb = require("../node_modules/taco-bell/index");
const ENTER_KEY_CODE = 13;
var TodoState;
(function (TodoState) {
    TodoState[TodoState["ACTIVE"] = 0] = "ACTIVE";
    TodoState[TodoState["COMPLETED"] = 1] = "COMPLETED";
})(TodoState || (TodoState = {}));
var TodoFilter;
(function (TodoFilter) {
    TodoFilter[TodoFilter["ALL"] = 0] = "ALL";
    TodoFilter[TodoFilter["ACTIVE"] = 1] = "ACTIVE";
    TodoFilter[TodoFilter["COMPLETED"] = 2] = "COMPLETED";
})(TodoFilter || (TodoFilter = {}));
let Todo = class Todo {
    constructor(description, state = TodoState.ACTIVE) {
        this.editing = new tb.ModelElement(false);
        this.description = new tb.ModelElement(description);
        this.state = new tb.ModelElement(state);
    }
};
Todo = __decorate([
    tb.persist
], Todo);
let TodoModel = class TodoModel {
    constructor(title = "todos", initialFilter = TodoFilter.ALL) {
        this.title = new tb.ModelElement(title);
        this.todos = new tb.ModelArray();
        this.filter = new tb.ModelElement(initialFilter);
    }
    serialize() {
        let plainObject = {
            todos: function () {
                let plainTodos = [];
                for (let todo of this.todos.get()) {
                    plainTodos.push({
                        description: todo.get().description.get(),
                        state: todo.get().state.get()
                    });
                }
                return plainTodos;
            }.bind(this)(),
            filter: this.filter.get()
        };
        return JSON.stringify(plainObject);
    }
    deserialize(todoModel, serialized) {
        let plainObject = JSON.parse(serialized);
        setTimeout(function () {
            todoModel.filter.set(plainObject["filter"]);
            for (let plainTodo of plainObject["todos"]) {
                todoModel.todos.add(new Todo(plainTodo["description"], plainTodo["state"]));
            }
        }, 100);
        return todoModel;
    }
};
TodoModel = __decorate([
    tb.persistentModel
], TodoModel);
const model = new TodoModel();
class FilterHandle extends tb.Component {
    constructor(label, filter) {
        super("li");
        this.child(new tb.Component("a")
            .withText(label)
            .withClass(new tb.Binding(model.filter, function (currentFilter) {
            return currentFilter == filter ? "selected" : "";
        }))
            .on("click", function () {
            model.filter.set(filter);
        }));
    }
}
new tb.Component("section", document.getElementById("app-root"))
    .withClass("todoapp")
    .child(new tb.Component("header")
    .withClass("header")
    .child(new tb.Component("h1")
    .withText(model.title), new tb.Component("input")
    .withClass("new-todo")
    .withAttribute("type", "text")
    .withAttribute("placeholder", "What needs to be done?")
    .on("keyup", function (event) {
    if (event.keyCode === ENTER_KEY_CODE) {
        let input = event.currentTarget;
        model.todos.add(new Todo(input.value));
        input.value = "";
    }
}), new tb.Component("section")
    .withClass("main")
    .child(new tb.Component("input")
    .withAttribute("type", "checkbox")
    .withClass("toggle-all")
    .on("click", function (event) {
    let state = event.currentTarget.checked ? TodoState.COMPLETED : TodoState.ACTIVE;
    for (let todo of model.todos.get())
        todo.get().state.set(state);
})), new tb.Collection("ul")
    .withClass("todo-list")
    .children(model.todos, function (todo) {
    let label = new tb.Component("label")
        .withText(todo.get().description)
        .on("click", function () {
        todo.get().editing.set(true);
        input.focus();
        this.hide();
    });
    let input = new tb.Component("input")
        .withAttribute("type", "text")
        .withClass(new tb.Binding(todo.get().editing, function (nowEditing) {
        return nowEditing ? "edit" : "edit hidden";
    }))
        .withValue(todo.get().description)
        .on("focusout", function (event) {
        this.hide();
        todo.get().editing.set(false);
        let newDescription = event.currentTarget.value;
        todo.get().description.set(newDescription);
        label.show();
    });
    function getTodoCssClass() {
        let todoState = todo.get().state.get();
        let editing = todo.get().editing.get();
        let filter = model.filter.get();
        return "todo " + ((filter == TodoFilter.ALL
            || (filter == TodoFilter.ACTIVE && todoState == TodoState.ACTIVE)
            || (filter == TodoFilter.COMPLETED) && todoState == TodoState.COMPLETED)
            ? ((todoState == TodoState.COMPLETED ? "completed " : "") + (editing ? "editing " : "")) : "hidden");
    }
    return new tb.Component("li")
        .withClass(new tb.Binding(todo.get().state, getTodoCssClass), new tb.Binding(model.filter, getTodoCssClass), new tb.Binding(todo.get().editing, getTodoCssClass))
        .child(new tb.Component("input")
        .withAttribute("type", "checkbox")
        .withClass("toggle")
        .withValue(new tb.TwoWayBinding(todo.get().state, function (newState) {
        return newState == TodoState.COMPLETED;
    }, function (isChecked) {
        return isChecked ? TodoState.COMPLETED : TodoState.ACTIVE;
    })), label, input, new tb.Component("button")
        .withClass("destroy")
        .on("click", function () {
        model.todos.remove(todo);
    }));
})), new tb.Component("footer")
    .withClass("footer", new tb.Binding(model.todos.size, function (currentSize) {
    return currentSize == 0 ? "hidden" : "";
}))
    .child(new tb.Component("span")
    .withClass("todo-count")
    .withText(new tb.Binding(model.todos.size, function (newSize) {
    return newSize + " items left";
})), new tb.Component("ul")
    .withClass("filters")
    .child(new FilterHandle("All", TodoFilter.ALL), new FilterHandle("Active", TodoFilter.ACTIVE), new FilterHandle("Completed", TodoFilter.COMPLETED))));
tb.ComponentQueue.cycle();
window["model"] = model;

},{"../node_modules/taco-bell/index":1}]},{},[15]);
