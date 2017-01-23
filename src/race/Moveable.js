(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../CanvasFunction", "../Intersectable"], function (require, exports) {
    "use strict";
    const CanvasFunction_1 = require("../CanvasFunction");
    const Intersectable_1 = require("../Intersectable");
    class MoveableModel extends CanvasFunction_1.CanvasFunction {
        constructor(initX, initY, gravity = 1, friction = 1, drawHandler, ...listenedTo) {
            super(initX, initY, drawHandler);
            this._jump_flag = false;
            this.entersCallbacks = new Map();
            for (let model of listenedTo) {
                this.listenedTo.push(model);
            }
            this.gravity = gravity;
            this.friction = friction;
        }
        onEnters(other, callback) {
            this.entersCallbacks.set(other, callback);
            return this;
        }
        checkEnters() {
            let cancel = false;
            for (let entry of this.entersCallbacks.entries()) {
                let other = entry[0];
                let callback = entry[1];
                let extrudes = Intersectable_1.enters(other, this);
                if (extrudes) {
                    if (callback(extrudes))
                        cancel = true;
                }
            }
            return cancel;
        }
        jump(strength) {
            if (this._jump_flag)
                return;
            this._jump_flag = true;
            let t = 1;
            let yInit = this.y.get();
            let update = () => {
                let yp = yInit - strength * t + this.gravity * Math.pow(t, 2);
                if (yp < yInit) {
                    this.y.set(yp);
                    console.log(t, this.y.get());
                    t++;
                    if (this.checkEnters()) {
                        this._jump_flag = false;
                        return;
                    }
                    setTimeout(update, MoveableModel.FRAME_LENGTH);
                }
                else {
                    this.y.set(yInit);
                    this.checkEnters();
                    this._jump_flag = false;
                }
            };
            update();
        }
        right() {
            let progress = 10 / this.friction;
            let maxT = 10;
            let t = 0;
            let xInit = this.x.get();
            let update = () => {
                this.x.set(xInit + progress * t);
                t++;
                if (t <= (maxT / 2)) {
                    if (this.checkEnters())
                        return;
                    setTimeout(update, MoveableModel.FRAME_LENGTH);
                }
            };
            update();
        }
        left() {
            let progress = 10 / this.friction;
            let maxT = 10;
            let t = 0;
            let xInit = this.x.get();
            let update = () => {
                this.x.set(xInit - progress * t);
                t++;
                if (t <= (maxT / 2)) {
                    if (this.checkEnters())
                        return;
                    setTimeout(update, MoveableModel.FRAME_LENGTH);
                }
            };
            update();
        }
    }
    MoveableModel.FRAME_LENGTH = 1000 / 24;
    exports.MoveableModel = MoveableModel;
});
