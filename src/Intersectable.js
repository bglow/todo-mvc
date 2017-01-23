(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    function getLineFunction(line) {
        return {
            minX: line.p1().x() < line.p2().x() ? line.p1().x() : line.p2().x(),
            maxX: line.p1().x() > line.p2().x() ? line.p1().x() : line.p2().x(),
            minY: line.p1().y() < line.p2().y() ? line.p1().y() : line.p2().y(),
            maxY: line.p1().y() > line.p2().y() ? line.p1().y() : line.p2().y()
        };
    }
    class DynamicPoint {
        constructor(x, y) {
            this._x = x;
            this._y = y;
            this.__p1 = { x: this._x.get(), y: this._y.get() };
            this.__p2 = { x: this._x.get(), y: this._y.get() };
            this._x.registerCallback(this, (newX) => {
                this.__p1.x = newX;
                this.__p1.y = this._y.get();
                let temp = this.__p2;
                this.__p2 = this.__p1;
                this.__p1 = temp;
            });
            this._y.registerCallback(this, (newY) => {
                this.__p1.y = newY;
                this.__p1.x = this._x.get();
                let temp = this.__p2;
                this.__p2 = this.__p1;
                this.__p1 = temp;
            });
            this._p1 = {
                x: function () { return this.__p1.x; }.bind(this),
                y: function () { return this.__p1.y; }.bind(this)
            };
            this._p2 = {
                x: function () { return this.__p2.x; }.bind(this),
                y: function () { return this.__p2.y; }.bind(this)
            };
            this._pProj = {
                x: function () {
                    return this._p2.x() + (this._p2.x() - this._p1.x());
                }.bind(this),
                y: function () {
                    return this._p2.y() + (this._p2.y() - this._p1.y());
                }.bind(this)
            };
        }
        x() {
            return this._x.get();
        }
        y() {
            return this._y.get();
        }
        p1() {
            return this._p2;
        }
        p2() {
            return this._pProj;
        }
    }
    exports.DynamicPoint = DynamicPoint;
    var ExtrudeDirection;
    (function (ExtrudeDirection) {
        ExtrudeDirection[ExtrudeDirection["TOP"] = 1] = "TOP";
        ExtrudeDirection[ExtrudeDirection["RIGHT"] = 2] = "RIGHT";
        ExtrudeDirection[ExtrudeDirection["BOTTOM"] = 3] = "BOTTOM";
        ExtrudeDirection[ExtrudeDirection["LEFT"] = 4] = "LEFT";
    })(ExtrudeDirection = exports.ExtrudeDirection || (exports.ExtrudeDirection = {}));
    class StaticLine {
        constructor(p1, p2) {
            this._p1 = p1;
            this._p2 = p2;
        }
        p1() {
            return this._p1.p2();
        }
        p2() {
            return this._p2.p2();
        }
        // if there is an intersection, return the extrusion direction of other relative this
        // i.e. if return LEFT, indicates that other extrudes to the left of this
        intersects(other) {
            let lf = getLineFunction(this);
            let lfO = getLineFunction(other);
            let lfR = lf.minX >= lfO.minX ? lf : lfO;
            let lfL = lfR === lf ? lfO : lf;
            let lfT = lf.minY <= lfO.minY ? lf : lfO;
            let lfB = lfT === lf ? lfO : lf;
            if (lfL.maxX >= lfR.minX
                && lfR.minX <= lfL.maxX
                && lfT.maxY >= lfB.minY
                && lfB.minY <= lfT.maxY) {
                if (lfO.maxY <= lf.maxY && lfO.minY >= lf.minY)
                    return lfO === lfL ? ExtrudeDirection.LEFT : ExtrudeDirection.RIGHT;
                else
                    return lfO === lfT ? ExtrudeDirection.TOP : ExtrudeDirection.BOTTOM;
            }
            return false;
        }
    }
    exports.StaticLine = StaticLine;
    function intersects(i1, i2) {
        for (let l1 of i1.lines()) {
            for (let l2 of i2.lines()) {
                let result = l1.intersects(l2);
                if (result)
                    return true;
            }
        }
        return false;
    }
    exports.intersects = intersects;
    function enters(intersectable, moveable) {
        for (let line of intersectable.lines()) {
            for (let point of moveable.dynamicPoints()) {
                let result = line.intersects(point);
                if (result)
                    return result;
            }
        }
        return false;
    }
    exports.enters = enters;
});
