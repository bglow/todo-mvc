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
