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
