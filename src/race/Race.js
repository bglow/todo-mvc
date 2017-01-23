(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../CanvasComponent", "../ModelElement", "./Moveable", "../Intersectable", "../FunctionalComponent"], function (require, exports) {
    "use strict";
    const CanvasComponent_1 = require("../CanvasComponent");
    const ModelElement_1 = require("../ModelElement");
    const Moveable_1 = require("./Moveable");
    const Intersectable_1 = require("../Intersectable");
    const FunctionalComponent_1 = require("../FunctionalComponent");
    const LEFT_KEYCODE = 37;
    const UP_KEYCODE = 38;
    const RIGHT_KEYCODE = 39;
    const DOWN_KEYCODE = 40;
    const GAME_HEIGHT = 400;
    const GAME_WIDTH = 400;
    class PlayerModel extends Moveable_1.MoveableModel {
        constructor(initX, initY, width, height, gravity, friction) {
            super(initX, initY, gravity, friction, function (x, y, width, height) {
                let ctx = this;
                ctx.strokeRect(0, 0, width, height);
            });
            this.width = new ModelElement_1.default(width);
            this.height = new ModelElement_1.default(height);
            this.listenedTo.push(this.x, this.y, this.width, this.height);
            let pNW = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x) => {
                return x;
            }, this.x), new FunctionalComponent_1.FunctionalElement((y) => {
                return y;
            }, this.y));
            let pSE = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x, width) => {
                return x + width;
            }, this.x, this.width), new FunctionalComponent_1.FunctionalElement((y, height) => {
                return y + height;
            }, this.y, this.height));
            let pSW = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x) => {
                return x;
            }, this.x), new FunctionalComponent_1.FunctionalElement((y, height) => {
                return y + height;
            }, this.y, this.height));
            let pNE = new Intersectable_1.DynamicPoint(new FunctionalComponent_1.FunctionalElement((x, width) => {
                return x + width;
            }, this.x, this.width), new FunctionalComponent_1.FunctionalElement((y) => {
                return y;
            }, this.y));
            this._points = [pNW, pSE, pSW, pNE];
            this._lines = [new Intersectable_1.StaticLine(pNW, pSE), new Intersectable_1.StaticLine(pSW, pNE)];
            this.postConstruct();
        }
        lines() {
            return this._lines;
        }
        dynamicPoints() {
            return this._points;
        }
        extrude(direction) {
            switch (direction) {
                case Intersectable_1.ExtrudeDirection.LEFT:
                case Intersectable_1.ExtrudeDirection.TOP:
                    return { x: this.x.get() - 1, y: this.y.get() - 1 };
                case Intersectable_1.ExtrudeDirection.RIGHT:
                    return { x: this.x.get() + this.width.get() + 1, y: this.y.get() - 1 };
                case Intersectable_1.ExtrudeDirection.BOTTOM:
                    return { x: this.x.get() + this.width.get() + 1, y: this.y.get() + this.height.get() + 1 };
            }
        }
    }
    // init the Player in the lower left corner
    let playerModel = new PlayerModel(0, 390, 10, 10, 1, 2);
    let otherPlayerModel = new PlayerModel(100, 380, 21, 21, 1, 2);
    playerModel.onEnters(otherPlayerModel, function (extrudeDirection) {
        console.log("bidi!", Intersectable_1.ExtrudeDirection[extrudeDirection]);
        let extrudePosition = otherPlayerModel.extrude(extrudeDirection);
        switch (extrudeDirection) {
            case Intersectable_1.ExtrudeDirection.LEFT:
                playerModel.x.set(extrudePosition.x - playerModel.width.get());
                break;
            case Intersectable_1.ExtrudeDirection.RIGHT:
                playerModel.x.set(extrudePosition.x);
                break;
            case Intersectable_1.ExtrudeDirection.TOP:
                playerModel.y.set(extrudePosition.y - playerModel.height.get());
                break;
            case Intersectable_1.ExtrudeDirection.BOTTOM:
                playerModel.y.set(extrudePosition.y);
                break;
        }
        return true;
    });
    new CanvasComponent_1.CanvasComponent(document.getElementById("app-root"))
        .withAttribute("width", GAME_HEIGHT)
        .withAttribute("height", GAME_WIDTH)
        .withDrawFunction(playerModel)
        .withDrawFunction(otherPlayerModel)
        .reinit();
    window.addEventListener("keydown", function (event) {
        switch (event.keyCode) {
            case UP_KEYCODE:
                playerModel.jump(25);
                break;
            case RIGHT_KEYCODE:
                playerModel.right();
                break;
            case LEFT_KEYCODE:
                playerModel.left();
                break;
        }
    });
    window["playerModel"] = playerModel;
});
