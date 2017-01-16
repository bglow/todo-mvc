(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../ModelElement"], function (require, exports) {
    "use strict";
    const ModelElement_1 = require("../ModelElement");
    class BlockModel extends ModelElement_1.default {
        constructor(x, y) {
            super();
            this.x = new ModelElement_1.default(x * BlockModel.SIDE_LENGTH);
            this.y = new ModelElement_1.default(y * BlockModel.SIDE_LENGTH);
        }
    }
    BlockModel.SIDE_LENGTH = 25;
    exports.BlockModel = BlockModel;
});
