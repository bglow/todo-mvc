(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../SVGComponent", "./BlockModel"], function (require, exports) {
    "use strict";
    const SVGComponent_1 = require("../SVGComponent");
    const BlockModel_1 = require("./BlockModel");
    class Piece {
        constructor(pieceModel) {
            this.blocks = [];
            let color = Piece.randomColor();
            for (let blockModel of pieceModel.blocks) {
                let blockComponent = new SVGComponent_1.default("rect")
                    .withAttribute("x", blockModel.x)
                    .withAttribute("y", blockModel.y)
                    .withAttribute("width", BlockModel_1.BlockModel.SIDE_LENGTH)
                    .withAttribute("height", BlockModel_1.BlockModel.SIDE_LENGTH)
                    .withAttribute("style", "stroke: #000000; fill: " + color + ";")
                    .reinit();
                blockModel.bindComponent(blockComponent);
                this.blocks.push(blockComponent);
            }
        }
        static randomColor() {
            return Piece.COLORS[Math.floor((Math.random() * (Piece.COLORS.length)))];
        }
    }
    Piece.COLORS = ['#FFAA55', '#AAFF55', '#AA55FF', '#FF55AA', '#55FFAA', '#55AAFF'];
    exports.Piece = Piece;
});
