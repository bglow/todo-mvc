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
            this.listenedTo = listenedTo;
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
