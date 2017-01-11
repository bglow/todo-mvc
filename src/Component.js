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
