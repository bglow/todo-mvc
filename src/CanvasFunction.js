(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./FunctionalComponent", "./ModelElement"], function (require, exports) {
    "use strict";
    const FunctionalComponent_1 = require("./FunctionalComponent");
    const ModelElement_1 = require("./ModelElement");
    class CanvasFunction extends FunctionalComponent_1.FunctionalElement {
        constructor(initX = 0, initY = 0, drawHandler, ...listenedTo) {
            super(() => {
                if (this.canvasComponent) {
                    this.canvasComponent.getContext().setTransform(1, 0, 0, 1, 0, 0);
                    this.canvasComponent.getContext().translate(this.x.get(), this.y.get());
                    drawHandler.apply(this.canvasComponent.getContext(), this.listenedTo.map(function (model) {
                        return model.get();
                    }));
                }
            });
            this.drawHandlers = [];
            this.x = new ModelElement_1.default(initX);
            this.y = new ModelElement_1.default(initY);
            for (let model of listenedTo) {
                this.listenedTo.push(model);
            }
            this.drawHandlers.push(drawHandler);
        }
        // implementing classes should call this after adding their listenedTos
        postConstruct() {
            for (let model of this.listenedTo)
                model.registerCallback(model, this.doUpdate.bind(this));
        }
        get() {
            this.handler.apply(this, this.listenedTo.map(function (model) {
                return model.get();
            }));
        }
        bindCanvas(canvasComponent) {
            this.canvasComponent = canvasComponent;
        }
        unbindCanvas() {
            this.canvasComponent = null;
        }
        doUpdate() {
            if (this.canvasComponent)
                this.canvasComponent.reinit();
        }
    }
    exports.CanvasFunction = CanvasFunction;
});
