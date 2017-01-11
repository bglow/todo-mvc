(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./Binding", "./ModelElement"], function (require, exports) {
    "use strict";
    const Binding_1 = require("./Binding");
    const ModelElement_1 = require("./ModelElement");
    class AbstractComponent {
        constructor(tagName, parent) {
            this.element = document.createElement(tagName || "div");
            if (parent != undefined) {
                this.parent = parent;
                parent.appendChild(this.element);
            }
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
        reinit() {
            this.updateClass();
            this.updateText();
            if (this.attrs) {
                for (let name in this.attrs) {
                    this.updateAttribute(name);
                }
            }
            // update value after attributes becauase input type may depend on an HtmlElement attribute
            this.updateValue();
            return this;
        }
        destroy() {
            this.element.parentElement.removeChild(this.element);
        }
        withClass(...classes) {
            if (!this.classes)
                this.classes = new Set();
            for (let cls of classes) {
                this.classes.add(cls);
                if (cls instanceof ModelElement_1.default)
                    cls.registerCallback(this, this.withClass.bind(this));
                else if (cls instanceof Binding_1.Binding) {
                    let binding = cls;
                    binding.model.registerCallback(this, this.updateClass.bind(this));
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
                else if (cp instanceof ModelElement_1.default) {
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
                    if (cls instanceof ModelElement_1.default) {
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
            if (text instanceof ModelElement_1.default) {
                text.registerCallback(this, this.updateText.bind(this));
            }
            else if (this.text instanceof Binding_1.Binding) {
                let binding = text;
                binding.model.registerCallback(this, this.updateText.bind(this));
            }
            return this;
        }
        updateText() {
            if (this.text != undefined) {
                let text;
                if (typeof this.text == "string")
                    text = this.text;
                else if (this.text instanceof ModelElement_1.default) {
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
                if (this.text instanceof ModelElement_1.default)
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
            // in case type attribute is bound to dynamic model, need to determine input type at runtime
            function setInputType() {
                let inputType = this.element.getAttribute("type");
                valueProp = inputType == "checkbox" || inputType == "radio" ? "checked" : "value";
            }
            if (value instanceof ModelElement_1.default) {
                value.registerCallback(this, this.updateValue.bind(this));
                this.element.onchange = function () {
                    setInputType.call(this);
                    value.set(this.element[valueProp]);
                }.bind(this);
            }
            else if (this.value instanceof Binding_1.TwoWayBinding) {
                let binding = value;
                binding.model.registerCallback(this, this.updateValue.bind(this));
                this.element.onchange = function () {
                    setInputType.call(this);
                    binding.model.set(binding.onUserUpdate(this.element[valueProp]), false);
                }.bind(this);
            }
            else if (this.value instanceof Binding_1.Binding) {
                let binding = value;
                binding.model.registerCallback(this, this.updateValue.bind(this));
                this.element.onchange = function () {
                    setInputType.call(this);
                    binding.model.set(this.element[valueProp], false);
                }.bind(this);
            }
            return this;
        }
        removeValue() {
            if (this.value != undefined) {
                if (this.value instanceof ModelElement_1.default) {
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
                else if (this.value instanceof ModelElement_1.default) {
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
            if (value instanceof ModelElement_1.default) {
                value.registerCallback(this, this.updateAttribute.bind(this, name));
            }
            else if (value instanceof Binding_1.Binding) {
                let binding = value;
                binding.model.registerCallback(this, this.updateAttribute.bind(this, name));
            }
            return this;
        }
        removeAttribute(name) {
            if (this.attrs != undefined) {
                if (this.attrs[name] != undefined) {
                    let value = this.attrs[name];
                    if (value instanceof ModelElement_1.default) {
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
                    if (value instanceof ModelElement_1.default) {
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
            this.element.addEventListener(eventName, eventHandler.bind(this));
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
});

},{"./Binding":2,"./ModelElement":8}],2:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./ModelElement", "./ModelArray"], function (require, exports) {
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
            if (this[member] instanceof ModelElement_1.default) {
                let modelElement = this[member];
                modelElement.set = function (a, b) {
                    ModelElement_1.default.prototype.set.call(modelElement, a, b);
                    exports.Persistence.store();
                };
            }
            if (this[member] instanceof ModelArray_1.default) {
                let modelArray = this[member];
                modelArray.add = function (a) {
                    ModelArray_1.default.prototype.add.call(modelArray, a);
                    exports.Persistence.store();
                    return modelArray;
                };
                modelArray.remove = function (a) {
                    ModelArray_1.default.prototype.remove.call(modelArray, a);
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
});

},{"./ModelArray":6,"./ModelElement":8}],3:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./AbstractComponent"], function (require, exports) {
    "use strict";
    const AbstractComponent_1 = require("./AbstractComponent");
    class Collection extends AbstractComponent_1.AbstractComponent {
        children(model, onAddCallback) {
            model.registerAddCallback(this, function (newItem) {
                let newComponent = onAddCallback(newItem);
                newItem.bindComponent(newComponent);
                this.element.appendChild(newComponent.getElement());
            }.bind(this));
            return this;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Collection;
});

},{"./AbstractComponent":1}],4:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./AbstractComponent"], function (require, exports) {
    "use strict";
    const AbstractComponent_1 = require("./AbstractComponent");
    class Component extends AbstractComponent_1.AbstractComponent {
        child(...components) {
            for (let component of components) {
                component.setParent(this);
                this.element.appendChild(component.getElement());
            }
            return this;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Component;
});

},{"./AbstractComponent":1}],5:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
});

},{}],6:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./ModelCollection", "./ModelElement"], function (require, exports) {
    "use strict";
    const ModelCollection_1 = require("./ModelCollection");
    const ModelElement_1 = require("./ModelElement");
    class ModelArray extends ModelCollection_1.ModelCollection {
        constructor(data) {
            super([]);
            this.size = new ModelElement_1.default(0);
            if (data) {
                for (let item of data) {
                    this.add(item);
                }
            }
        }
        add(member) {
            if (!this.addCallbacks)
                this.addCallbacks = new Map();
            let newMember = new ModelElement_1.default(member);
            this.data.push(newMember);
            for (let callbackSet of this.addCallbacks.values()) {
                for (let callback of callbackSet.values()) {
                    callback(newMember);
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
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ModelArray;
});

},{"./ModelCollection":7,"./ModelElement":8}],7:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./ModelElement"], function (require, exports) {
    "use strict";
    const ModelElement_1 = require("./ModelElement");
    class ModelCollection extends ModelElement_1.default {
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
});

},{"./ModelElement":8}],8:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    class ModelElement {
        constructor(data) {
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
        destroy() {
            for (let component of this.boundComponents.values())
                component.destroy();
        }
        doUpdate() {
            if (!this.updateCallbacks)
                return;
            for (let callbackSet of this.updateCallbacks.values()) {
                for (let callback of callbackSet.values())
                    callback(this.data);
            }
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
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ModelElement;
});

},{}],9:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],10:[function(require,module,exports){
/// <reference path="./lib.es6.d.ts"/>
/// <reference path="./Binding.ts"/>
/// <reference path="./Component.ts"/>
/// <reference path="./Html.ts"/>
/// <reference path="./ModelElement.ts"/>
// test classes
/// <reference path="./test/todo.ts"/> 

},{}]},{},[1,2,3,4,5,6,7,8,9,10]);
