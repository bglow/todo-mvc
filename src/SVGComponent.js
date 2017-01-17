(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./Component"], function (require, exports) {
    "use strict";
    const Component_1 = require("./Component");
    class SVGComponent extends Component_1.default {
        constructor(tagName, parent) {
            super(tagName, parent, "http://www.w3.org/2000/svg");
        }
        withClass(...classes) {
            throw new Error("Cannot apply class to SVG element. Classname is readonly");
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SVGComponent;
});
