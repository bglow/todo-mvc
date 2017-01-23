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
        constructor(tagName, parent, namespace) {
            if (!namespace)
                this.element = document.createElement(tagName || "div");
            else
                this.element = document.createElementNS(namespace, tagName);
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
        // value should be bound with a two way binding
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
                    binding.model.set(binding.onUserUpdate(this.element[valueProp]));
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

},{"./Binding":3,"./ModelElement":10}],2:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
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
        }
    }
    exports.AbstractElement = AbstractElement;
});

},{}],3:[function(require,module,exports){
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

},{"./ModelArray":8,"./ModelElement":10}],4:[function(require,module,exports){
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
    class CanvasComponent extends AbstractComponent_1.AbstractComponent {
        constructor(parent) {
            super("canvas", parent);
            this.canvasFunctions = [];
        }
        getContext() {
            return this.element.getContext('2d');
        }
        withDrawFunction(canvasFunction) {
            this.canvasFunctions.push(canvasFunction);
            canvasFunction.bindCanvas(this);
            return this;
        }
        reinit() {
            super.reinit();
            // clear the canvas before redrawing
            this.getContext()
                .clearRect(0, 0, this.getElement().width, this.getElement().height);
            for (let canvasFunction of this.canvasFunctions)
                canvasFunction.get();
            return this;
        }
    }
    exports.CanvasComponent = CanvasComponent;
});

},{"./AbstractComponent":1}],5:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./FunctionalComponent", "./ModelElement"], function (require, exports) {
    "use strict";
    const FunctionalComponent_1 = require("./FunctionalComponent");
    const ModelElement_1 = require("./ModelElement");
    class CanvasFunction extends FunctionalComponent_1.FunctionalElement {
        constructor(initX = 0, initY = 0, drawHandler, ...listenedTo) {
            super(() => {
                if (this.canvasComponent) {
                    this.canvasComponent.getContext().setTransform(1, 0, 0, 1, 0, 0);
                    this.canvasComponent.getContext().translate(this.x.get(), this.y.get());
                    drawHandler.apply(this.canvasComponent.getContext(), this.listenedTo.map(function (model) {
                        return model.get();
                    }));
                }
            });
            this.drawHandlers = [];
            this.x = new ModelElement_1.default(initX);
            this.y = new ModelElement_1.default(initY);
            for (let model of listenedTo) {
                this.listenedTo.push(model);
            }
            this.drawHandlers.push(drawHandler);
        }
        // implementing classes should call this after adding their listenedTos
        postConstruct() {
            for (let model of this.listenedTo)
                model.registerCallback(model, this.doUpdate.bind(this));
        }
        get() {
            this.handler.apply(this, this.listenedTo.map(function (model) {
                return model.get();
            }));
        }
        bindCanvas(canvasComponent) {
            this.canvasComponent = canvasComponent;
        }
        unbindCanvas() {
            this.canvasComponent = null;
        }
        doUpdate() {
            if (this.canvasComponent)
                this.canvasComponent.reinit();
        }
    }
    exports.CanvasFunction = CanvasFunction;
});

},{"./FunctionalComponent":6,"./ModelElement":10}],6:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./AbstractElement"], function (require, exports) {
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
    }
    exports.FunctionalElement = FunctionalElement;
});

},{"./AbstractElement":2}],7:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    function getLineFunction(line) {
        return {
            minX: line.p1().x() < line.p2().x() ? line.p1().x() : line.p2().x(),
            maxX: line.p1().x() > line.p2().x() ? line.p1().x() : line.p2().x(),
            minY: line.p1().y() < line.p2().y() ? line.p1().y() : line.p2().y(),
            maxY: line.p1().y() > line.p2().y() ? line.p1().y() : line.p2().y()
        };
    }
    class DynamicPoint {
        constructor(x, y) {
            this._x = x;
            this._y = y;
            this.__p1 = { x: this._x.get(), y: this._y.get() };
            this.__p2 = { x: this._x.get(), y: this._y.get() };
            this._x.registerCallback(this, (newX) => {
                this.__p1.x = newX;
                this.__p1.y = this._y.get();
                let temp = this.__p2;
                this.__p2 = this.__p1;
                this.__p1 = temp;
            });
            this._y.registerCallback(this, (newY) => {
                this.__p1.y = newY;
                this.__p1.x = this._x.get();
                let temp = this.__p2;
                this.__p2 = this.__p1;
                this.__p1 = temp;
            });
            this._p1 = {
                x: function () { return this.__p1.x; }.bind(this),
                y: function () { return this.__p1.y; }.bind(this)
            };
            this._p2 = {
                x: function () { return this.__p2.x; }.bind(this),
                y: function () { return this.__p2.y; }.bind(this)
            };
            this._pProj = {
                x: function () {
                    return this._p2.x() + (this._p2.x() - this._p1.x());
                }.bind(this),
                y: function () {
                    return this._p2.y() + (this._p2.y() - this._p1.y());
                }.bind(this)
            };
        }
        x() {
            return this._x.get();
        }
        y() {
            return this._y.get();
        }
        p1() {
            return this._p2;
        }
        p2() {
            return this._pProj;
        }
    }
    exports.DynamicPoint = DynamicPoint;
    var ExtrudeDirection;
    (function (ExtrudeDirection) {
        ExtrudeDirection[ExtrudeDirection["TOP"] = 1] = "TOP";
        ExtrudeDirection[ExtrudeDirection["RIGHT"] = 2] = "RIGHT";
        ExtrudeDirection[ExtrudeDirection["BOTTOM"] = 3] = "BOTTOM";
        ExtrudeDirection[ExtrudeDirection["LEFT"] = 4] = "LEFT";
    })(ExtrudeDirection = exports.ExtrudeDirection || (exports.ExtrudeDirection = {}));
    class StaticLine {
        constructor(p1, p2) {
            this._p1 = p1;
            this._p2 = p2;
        }
        p1() {
            return this._p1.p2();
        }
        p2() {
            return this._p2.p2();
        }
        // if there is an intersection, return the extrusion direction of other relative this
        // i.e. if return LEFT, indicates that other extrudes to the left of this
        intersects(other) {
            let lf = getLineFunction(this);
            let lfO = getLineFunction(other);
            let lfR = lf.minX >= lfO.minX ? lf : lfO;
            let lfL = lfR === lf ? lfO : lf;
            let lfT = lf.minY <= lfO.minY ? lf : lfO;
            let lfB = lfT === lf ? lfO : lf;
            if (lfL.maxX >= lfR.minX
                && lfR.minX <= lfL.maxX
                && lfT.maxY >= lfB.minY
                && lfB.minY <= lfT.maxY) {
                if (lfO.maxY <= lf.maxY && lfO.minY >= lf.minY)
                    return lfO === lfL ? ExtrudeDirection.LEFT : ExtrudeDirection.RIGHT;
                else
                    return lfO === lfT ? ExtrudeDirection.TOP : ExtrudeDirection.BOTTOM;
            }
            return false;
        }
    }
    exports.StaticLine = StaticLine;
    function intersects(i1, i2) {
        for (let l1 of i1.lines()) {
            for (let l2 of i2.lines()) {
                let result = l1.intersects(l2);
                if (result)
                    return true;
            }
        }
        return false;
    }
    exports.intersects = intersects;
    function enters(intersectable, moveable) {
        for (let line of intersectable.lines()) {
            for (let point of moveable.dynamicPoints()) {
                let result = line.intersects(point);
                if (result)
                    return result;
            }
        }
        return false;
    }
    exports.enters = enters;
});

},{}],8:[function(require,module,exports){
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

},{"./ModelCollection":9,"./ModelElement":10}],9:[function(require,module,exports){
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

},{"./ModelElement":10}],10:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./AbstractElement"], function (require, exports) {
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
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ModelElement;
});

},{"./AbstractElement":2}],11:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../CanvasFunction", "../Intersectable"], function (require, exports) {
    "use strict";
    const CanvasFunction_1 = require("../CanvasFunction");
    const Intersectable_1 = require("../Intersectable");
    class MoveableModel extends CanvasFunction_1.CanvasFunction {
        constructor(initX, initY, gravity = 1, friction = 1, drawHandler, ...listenedTo) {
            super(initX, initY, drawHandler);
            this._jump_flag = false;
            this.entersCallbacks = new Map();
            for (let model of listenedTo) {
                this.listenedTo.push(model);
            }
            this.gravity = gravity;
            this.friction = friction;
        }
        onEnters(other, callback) {
            this.entersCallbacks.set(other, callback);
            return this;
        }
        checkEnters() {
            let cancel = false;
            for (let entry of this.entersCallbacks.entries()) {
                let other = entry[0];
                let callback = entry[1];
                let extrudes = Intersectable_1.enters(other, this);
                if (extrudes) {
                    if (callback(extrudes))
                        cancel = true;
                }
            }
            return cancel;
        }
        jump(strength) {
            if (this._jump_flag)
                return;
            this._jump_flag = true;
            let t = 1;
            let yInit = this.y.get();
            let update = () => {
                let yp = yInit - strength * t + this.gravity * Math.pow(t, 2);
                if (yp < yInit) {
                    this.y.set(yp);
                    console.log(t, this.y.get());
                    t++;
                    if (this.checkEnters()) {
                        this._jump_flag = false;
                        return;
                    }
                    setTimeout(update, MoveableModel.FRAME_LENGTH);
                }
                else {
                    this.y.set(yInit);
                    this.checkEnters();
                    this._jump_flag = false;
                }
            };
            update();
        }
        right() {
            let progress = 10 / this.friction;
            let maxT = 10;
            let t = 0;
            let xInit = this.x.get();
            let update = () => {
                this.x.set(xInit + progress * t);
                t++;
                if (t <= (maxT / 2)) {
                    if (this.checkEnters())
                        return;
                    setTimeout(update, MoveableModel.FRAME_LENGTH);
                }
            };
            update();
        }
        left() {
            let progress = 10 / this.friction;
            let maxT = 10;
            let t = 0;
            let xInit = this.x.get();
            let update = () => {
                this.x.set(xInit - progress * t);
                t++;
                if (t <= (maxT / 2)) {
                    if (this.checkEnters())
                        return;
                    setTimeout(update, MoveableModel.FRAME_LENGTH);
                }
            };
            update();
        }
    }
    MoveableModel.FRAME_LENGTH = 1000 / 24;
    exports.MoveableModel = MoveableModel;
});

},{"../CanvasFunction":5,"../Intersectable":7}],12:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../CanvasComponent", "../ModelElement", "./Moveable", "../Intersectable", "../FunctionalComponent"], function (require, exports) {
    "use strict";
    const CanvasComponent_1 = require("../CanvasComponent");
    const ModelElement_1 = require("../ModelElement");
    const Moveable_1 = require("./Moveable");
    const Intersectable_1 = require("../Intersectable");
    const FunctionalComponent_1 = require("../FunctionalComponent");
    const LEFT_KEYCODE = 37;
    const UP_KEYCODE = 38;
    const RIGHT_KEYCODE = 39;
    const DOWN_KEYCODE = 40;
    const GAME_HEIGHT = 400;
    const GAME_WIDTH = 400;
    class PlayerModel extends Moveable_1.MoveableModel {
        constructor(initX, initY, width, height, gravity, friction) {
            super(initX, initY, gravity, friction, function (x, y, width, height) {
                let ctx = this;
                ctx.strokeRect(0, 0, width, height);
            });
            this.width = new ModelElement_1.default(width);
            this.height = new ModelElement_1.default(height);
            this.listenedTo.push(this.x, this.y, this.width, this.height);
            let pNW = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x) => {
                return x;
            }, this.x), new FunctionalComponent_1.FunctionalElement((y) => {
                return y;
            }, this.y));
            let pSE = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x, width) => {
                return x + width;
            }, this.x, this.width), new FunctionalComponent_1.FunctionalElement((y, height) => {
                return y + height;
            }, this.y, this.height));
            let pSW = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x) => {
                return x;
            }, this.x), new FunctionalComponent_1.FunctionalElement((y, height) => {
                return y + height;
            }, this.y, this.height));
            let pNE = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x, width) => {
                return x + width;
            }, this.x, this.width), new FunctionalComponent_1.FunctionalElement((y) => {
                return y;
            }, this.y));
            this._points = [pNW, pSE, pSW, pNE];
            this._lines = [new Intersectable_1.StaticLine(pNW, pSE), new Intersectable_1.StaticLine(pSW, pNE)];
            this.postConstruct();
        }
        lines() {
            return this._lines;
        }
        dynamicPoints() {
            return this._points;
        }
        extrude(direction) {
            switch (direction) {
                case Intersectable_1.ExtrudeDirection.LEFT:
                case Intersectable_1.ExtrudeDirection.TOP:
                    return { x: this.x.get() - 1, y: this.y.get() - 1 };
                case Intersectable_1.ExtrudeDirection.RIGHT:
                    return { x: this.x.get() + this.width.get() + 1, y: this.y.get() - 1 };
                case Intersectable_1.ExtrudeDirection.BOTTOM:
                    return { x: this.x.get() + this.width.get() + 1, y: this.y.get() + this.height.get() + 1 };
            }
        }
    }
    // init the Player in the lower left corner
    let playerModel = new PlayerModel(0, 390, 10, 10, 1, 2);
    let otherPlayerModel = new PlayerModel(100, 380, 21, 21, 1, 2);
    playerModel.onEnters(otherPlayerModel, function (extrudeDirection) {
        console.log("bidi!", Intersectable_1.ExtrudeDirection[extrudeDirection]);
        let extrudePosition = otherPlayerModel.extrude(extrudeDirection);
        switch (extrudeDirection) {
            case Intersectable_1.ExtrudeDirection.LEFT:
                playerModel.x.set(extrudePosition.x - playerModel.width.get());
                break;
            case Intersectable_1.ExtrudeDirection.RIGHT:
                playerModel.x.set(extrudePosition.x);
                break;
            case Intersectable_1.ExtrudeDirection.TOP:
                playerModel.y.set(extrudePosition.y - playerModel.height.get());
                break;
            case Intersectable_1.ExtrudeDirection.BOTTOM:
                playerModel.y.set(extrudePosition.y);
                break;
        }
        return true;
    });
    new CanvasComponent_1.CanvasComponent(document.getElementById("app-root"))
        .withAttribute("width", GAME_HEIGHT)
        .withAttribute("height", GAME_WIDTH)
        .withDrawFunction(playerModel)
        .withDrawFunction(otherPlayerModel)
        .reinit();
    window.addEventListener("keydown", function (event) {
        switch (event.keyCode) {
            case UP_KEYCODE:
                playerModel.jump(25);
                break;
            case RIGHT_KEYCODE:
                playerModel.right();
                break;
            case LEFT_KEYCODE:
                playerModel.left();
                break;
        }
    });
    window["playerModel"] = playerModel;
});

},{"../CanvasComponent":4,"../FunctionalComponent":6,"../Intersectable":7,"../ModelElement":10,"./Moveable":11}]},{},[12]);
