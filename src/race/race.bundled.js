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

},{"./Binding":4,"./ModelElement":9}],2:[function(require,module,exports){
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
})(["require", "exports", "./AbstractComponent", "./Time", "./Intersectable", "./ModelElement", "./FunctionalComponent"], function (require, exports) {
    "use strict";
    const AbstractComponent_1 = require("./AbstractComponent");
    const Time_1 = require("./Time");
    const Intersectable_1 = require("./Intersectable");
    const ModelElement_1 = require("./ModelElement");
    const FunctionalComponent_1 = require("./FunctionalComponent");
    class CanvasElement {
        constructor(x, y, w, h, draw, vx, vy, onTurn, anchorX, anchorY) {
            this.x = new ModelElement_1.default(x);
            this.y = new ModelElement_1.default(y);
            this.w = new ModelElement_1.default(w);
            this.h = new ModelElement_1.default(h);
            this.draw = draw;
            this.vx = vx || 0;
            this.vy = vy || 0;
            this.ax = 0;
            this.ay = 0;
            this.onTurn = onTurn;
            this.anchorX = anchorX || new FunctionalComponent_1.FunctionalElement((x, w) => {
                return x + w / 2;
            }, this.x, this.w);
            this.anchorY = anchorY || new FunctionalComponent_1.FunctionalElement((y, h) => {
                return y + h / 2;
            }, this.y, this.h);
        }
        resetBounds() {
            this.bL = null;
            this.bT = null;
            this.bT = null;
            this.bB = null;
            return this;
        }
        bounded(direction) {
            switch (direction) {
                case Intersectable_1.ExtrudeDirection.BOTTOM:
                    return this.bB != undefined;
                case Intersectable_1.ExtrudeDirection.TOP:
                    return this.bT != undefined;
                case Intersectable_1.ExtrudeDirection.LEFT:
                    return this.bL != undefined;
                case Intersectable_1.ExtrudeDirection.RIGHT:
                    return this.bR != undefined;
            }
        }
        move() {
            this.x.set(this.nextX(this.x.get()));
            this.vx += this.ax;
            this.y.set(this.nextY(this.y.get()));
            this.vy += this.ay;
            return this;
        }
        nextX(initX) {
            let nextX = initX + (this.vx + this.ax);
            if (this.bL && nextX < this.bL) {
                nextX = this.bL;
            }
            else if (this.bR && nextX > this.bR) {
                nextX = this.bR;
            }
            return nextX;
        }
        nextY(initY) {
            let nextY = initY + (this.vy + this.ay);
            if (this.bT && nextY < this.bT) {
                nextY = this.bT;
            }
            else if (this.bB && nextY + this.h.get() > this.bB) {
                nextY = this.bB - this.h.get();
            }
            return nextY;
        }
        extrude(other, direction) {
            switch (direction) {
                case Intersectable_1.ExtrudeDirection.TOP:
                    other.bB = this.y.get();
                    other.vy = CanvasElement.SPEED_EPSILON;
                    break;
                case Intersectable_1.ExtrudeDirection.LEFT:
                    other.bR = this.x.get();
                    other.vx = CanvasElement.SPEED_EPSILON;
                    break;
                case Intersectable_1.ExtrudeDirection.BOTTOM:
                    other.bT = this.y.get();
                    other.vy = -1 * CanvasElement.SPEED_EPSILON;
                    break;
                case Intersectable_1.ExtrudeDirection.RIGHT:
                    other.bL = this.x.get() + this.w.get();
                    other.vx = -1 * CanvasElement.SPEED_EPSILON;
                    break;
            }
        }
    }
    // on collision immediately reduce the velocity to a small but non-zero number to avoid shaking near edges
    CanvasElement.SPEED_EPSILON = 3;
    exports.CanvasElement = CanvasElement;
    class DynamicCanvasElement extends CanvasElement {
        constructor(x, y, w, h, draw, vx, vy, onTurn, anchorX, anchorY) {
            super(x, y, w, h, draw, vx, vy, onTurn, anchorX, anchorY);
            this._p1 = {
                x: function () {
                    return this.anchorX.get();
                }.bind(this),
                y: function () {
                    return this.anchorY.get();
                }.bind(this)
            };
            this._p2 = {
                x: function () {
                    return this.nextX(this.anchorX.get());
                }.bind(this),
                y: function () {
                    return this.nextY(this.anchorY.get());
                }.bind(this)
            };
        }
        p1() {
            return this._p1;
        }
        p2() {
            return this._p2;
        }
    }
    exports.DynamicCanvasElement = DynamicCanvasElement;
    class StaticCanvasElement extends CanvasElement {
        constructor(x, y, w, h, draw, vx, vy, onTurn, anchorX, anchorY) {
            super(x, y, w, h, draw, vx, vy, onTurn, anchorX, anchorY);
            this._lines = [
                new Intersectable_1.StaticLine(this.x.get(), this.y.get(), this.x.get() + this.w.get(), this.y.get() + this.h.get()),
                new Intersectable_1.StaticLine(this.x, this.y.get() + this.h.get(), this.x.get() + this.w.get(), this.y.get())
            ];
        }
        lines() {
            return this._lines;
        }
    }
    exports.StaticCanvasElement = StaticCanvasElement;
    class AnimatableCanvas extends AbstractComponent_1.AbstractComponent {
        constructor(parent) {
            super("canvas", parent);
            this.time = new Time_1.Time(1000 / 24);
            this.elements = { static: {}, dynamic: {} };
            this.groupedByRank = {};
            this.time.onTic(this.onTic.bind(this));
        }
        onTic() {
            this.getContext()
                .clearRect(0, 0, this.getElement().width, this.getElement().height);
            for (let element of this.rankedElements) {
                element.resetBounds();
                if (element.onTurn)
                    element.onTurn(this.elements);
            }
            for (let element of this.rankedElements)
                element.move();
            for (let element of this.rankedElements) {
                if (element.draw)
                    element.draw(this.getContext());
            }
        }
        getContext() {
            return this.element.getContext('2d');
        }
        withElement(element, name, rank) {
            if (element instanceof StaticCanvasElement)
                this.elements.static[name || Object.keys(this.elements).length] = element;
            else if (element instanceof DynamicCanvasElement)
                this.elements.dynamic[name || Object.keys(this.elements).length] = element;
            if (!this.groupedByRank[rank])
                this.groupedByRank[rank] = [];
            this.groupedByRank[rank].push(element);
            return this;
        }
        reinit() {
            super.reinit();
            this.rankedElements = [];
            for (let rank of Object.keys(this.groupedByRank).sort(function (r1, r2) {
                return Number(r1) - Number(r2);
            })) {
                for (let element of this.groupedByRank[rank])
                    this.rankedElements.push(element);
            }
            return this;
        }
    }
    exports.AnimatableCanvas = AnimatableCanvas;
});

},{"./AbstractComponent":1,"./FunctionalComponent":5,"./Intersectable":6,"./ModelElement":9,"./Time":10}],4:[function(require,module,exports){
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

},{"./ModelArray":7,"./ModelElement":9}],5:[function(require,module,exports){
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

},{"./AbstractElement":2}],6:[function(require,module,exports){
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
            this._x.registerCallback(this, (newX) => {
                this._px1 = this._px2;
                this._py1 = this._py2;
                this._px2 = newX;
                this._py2 = this._y.get();
            });
            this._y = y;
            this._y.registerCallback(this, (newY) => {
                this._px1 = this._px2;
                this._py1 = this._py2;
                this._py2 = newY;
                this._px2 = this._x.get();
            });
            this._p1 = {
                x: function () {
                    return this._x.get();
                }.bind(this),
                y: function () {
                    return this._y.get();
                }.bind(this)
            };
            this._p2 = {
                x: function () {
                    return this._x.get() + (this._px2 - this._px1);
                }.bind(this),
                y: function () {
                    return this._y.get() + (this._py2 - this._py1);
                }.bind(this)
            };
            this._px1 = this._x.get();
            this._px2 = this._x.get();
            this._py1 = this._y.get();
            this._py2 = this._y.get();
        }
        x() {
            return this._x.get();
        }
        y() {
            return this._y.get();
        }
        p1() {
            return this._p1;
        }
        p2() {
            return this._p2;
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
        constructor(x1, y1, x2, y2) {
            this._p1 = {
                x: () => { return x1; },
                y: () => { return y1; }
            };
            this._p2 = {
                x: () => { return x2; },
                y: () => { return y2; }
            };
        }
        p1() {
            return this._p1;
        }
        p2() {
            return this._p2;
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
    function enters(intersectable, movingPoint) {
        for (let line of intersectable.lines()) {
            let result = line.intersects(movingPoint);
            if (result)
                return result;
        }
        return false;
    }
    exports.enters = enters;
});

},{}],7:[function(require,module,exports){
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

},{"./ModelCollection":8,"./ModelElement":9}],8:[function(require,module,exports){
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

},{"./ModelElement":9}],9:[function(require,module,exports){
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

},{"./AbstractElement":2}],10:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    class Time {
        constructor(frameLength) {
            this.callbacks = new Set();
            this.frameLength = frameLength;
            this.intervalId = window.setInterval(() => {
                for (let callback of this.callbacks.values())
                    callback();
            }, this.frameLength);
        }
        onTic(callback) {
            this.callbacks.add(callback);
        }
    }
    exports.Time = Time;
});

},{}],11:[function(require,module,exports){
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../AnimatableCanvas", "../Intersectable"], function (require, exports) {
    "use strict";
    const AnimatableCanvas_1 = require("../AnimatableCanvas");
    const Intersectable_1 = require("../Intersectable");
    const LEFT_KEYCODE = 37;
    const UP_KEYCODE = 38;
    const RIGHT_KEYCODE = 39;
    const DOWN_KEYCODE = 40;
    const GAME_HEIGHT = 400;
    const GAME_WIDTH = 400;
    class Race extends AnimatableCanvas_1.AnimatableCanvas {
        constructor() {
            super(document.getElementById("app-root"));
            let player = new AnimatableCanvas_1.DynamicCanvasElement(0, 390, 10, 10, function (ctx) {
                ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
            });
            player.ay = 1;
            let ground = new AnimatableCanvas_1.StaticCanvasElement(0, GAME_HEIGHT, GAME_WIDTH, 1, function (ctx) {
                ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
            }, 0, 0, function (elements) {
                let player = elements.dynamic["player"];
                let direction = Intersectable_1.enters(this, player);
                if (direction == Intersectable_1.ExtrudeDirection.TOP && player.vy >= 0) {
                    this.extrude(player, Intersectable_1.ExtrudeDirection.TOP);
                }
            });
            let platform = new AnimatableCanvas_1.StaticCanvasElement(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH * 0.25, 5, function (ctx) {
                ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
            }, 0, 0, function (elements) {
                let player = elements.dynamic["player"];
                let direction = Intersectable_1.enters(this, player);
                if (direction == Intersectable_1.ExtrudeDirection.TOP && player.vy >= 0) {
                    this.extrude(player, Intersectable_1.ExtrudeDirection.TOP);
                }
            });
            window.addEventListener("keydown", function (event) {
                switch (event.keyCode) {
                    case UP_KEYCODE:
                        if (player.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
                            player.vy = -10;
                            player.vy = Math.min(player.vy, -1 * Race.MAX_SPEED);
                        }
                        break;
                    case RIGHT_KEYCODE:
                        if (player.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
                            player.vx += 1;
                            player.vx = Math.min(player.vx, Race.MAX_SPEED);
                        }
                        break;
                    case LEFT_KEYCODE:
                        if (player.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
                            player.vx -= 1;
                            player.vx = Math.max(player.vx, -1 * Race.MAX_SPEED);
                        }
                        break;
                }
            });
            this.withAttribute("width", GAME_HEIGHT)
                .withAttribute("height", GAME_WIDTH)
                .withElement(ground, "ground", 1)
                .withElement(platform, "platform", 1)
                .withElement(player, "player", 0)
                .reinit();
        }
        onTic() {
            super.onTic();
            for (let element of this.rankedElements) {
                if (element.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
                    if (element.vx > Race.EPSILON)
                        element.ax = Race.FRICTION * -1;
                    else if (element.vx < -1 * Race.EPSILON)
                        element.ax = Race.FRICTION;
                    else {
                        element.vx = 0;
                        element.ax = 0;
                    }
                }
            }
        }
    }
    Race.MAX_SPEED = 4;
    Race.FRICTION = 0.1;
    Race.EPSILON = 0.1;
    window["Race"] = new Race();
});

},{"../AnimatableCanvas":3,"../Intersectable":6}]},{},[11]);
