(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    exports.gameWidth = 8;
    exports.gameHeight = 15;
    var Direction;
    (function (Direction) {
        Direction[Direction["LEFT"] = 0] = "LEFT";
        Direction[Direction["DOWN"] = 1] = "DOWN";
        Direction[Direction["RIGHT"] = 2] = "RIGHT";
        Direction[Direction["AUTO_DOWN"] = 3] = "AUTO_DOWN";
    })(Direction = exports.Direction || (exports.Direction = {}));
});
