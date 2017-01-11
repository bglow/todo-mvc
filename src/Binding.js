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
