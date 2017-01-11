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
