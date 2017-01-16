(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./PieceModel", "./BlockModel"], function (require, exports) {
    "use strict";
    /*
     block arrangement:
    
     i B
     D A C
    
     where A is anchor, and i is init
    
     */
    const PieceModel_1 = require("./PieceModel");
    const BlockModel_1 = require("./BlockModel");
    class PyramdPieceModel extends PieceModel_1.PieceModel {
        constructor(initX, initY) {
            super();
            this.anchor = new BlockModel_1.BlockModel(initX + 1, initY + 1);
            this.blocks.push(this.anchor);
            this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY));
            this.blocks.push(new BlockModel_1.BlockModel(initX + 2, initY + 1));
            this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 1));
        }
    }
    exports.PyramdPieceModel = PyramdPieceModel;
});
