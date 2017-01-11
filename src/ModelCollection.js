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
