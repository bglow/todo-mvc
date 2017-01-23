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
