(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./BlockModel", "./shared"], function (require, exports) {
    "use strict";
    const BlockModel_1 = require("./BlockModel");
    const shared_1 = require("./shared");
    class PieceModel {
        constructor() {
            this.blocks = [];
        }
        rotate() {
            // return false if rotation would move a block outside of the gameboard
            function rotateBlockClockwise(acc, anchor, block) {
                let dy = block.y.get() - anchor.y.get();
                let dx = block.x.get() - anchor.x.get();
                let move = {
                    block: block,
                    x: anchor.x.get() + dy,
                    y: anchor.y.get() - dx
                };
                acc.push(move);
                return move.x >= 0 && (move.x < shared_1.gameWidth * BlockModel_1.BlockModel.SIDE_LENGTH);
            }
            let moves = [];
            for (let block of this.blocks) {
                if (!rotateBlockClockwise(moves, this.anchor, block))
                    return;
            }
            for (let move of moves) {
                move.block.x.set(move.x);
                move.block.y.set(move.y);
            }
        }
        // returns true if the move was valid
        move(tetris, direction) {
            let validMove = false;
            let grouped = {
                x: {},
                y: {}
            };
            for (let block of this.blocks) {
                let x = block.x.get();
                if (!grouped.x[x])
                    grouped.x[x] = [];
                grouped.x[x].push(block);
                let y = block.y.get();
                if (!grouped.y[y])
                    grouped.y[y] = [];
                grouped.y[y].push(block);
            }
            outter: switch (direction) {
                case shared_1.Direction.LEFT:
                    if (grouped.x[0] == undefined) {
                        for (let block of this.blocks) {
                            let currentLine = tetris.lines[block.y.get()];
                            if (currentLine && currentLine.blocks[block.x.get() - BlockModel_1.BlockModel.SIDE_LENGTH])
                                break outter;
                        }
                        for (let block of this.blocks)
                            block.x.set(block.x.get() - BlockModel_1.BlockModel.SIDE_LENGTH);
                        validMove = true;
                    }
                    break;
                case shared_1.Direction.RIGHT:
                    if (grouped.x[(BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameWidth) - BlockModel_1.BlockModel.SIDE_LENGTH] == undefined) {
                        for (let block of this.blocks) {
                            let currentLine = tetris.lines[block.y.get()];
                            if (currentLine && currentLine.blocks[block.x.get() + BlockModel_1.BlockModel.SIDE_LENGTH])
                                break outter;
                        }
                        for (let block of this.blocks)
                            block.x.set(block.x.get() + BlockModel_1.BlockModel.SIDE_LENGTH);
                        validMove = true;
                    }
                    break;
                case shared_1.Direction.DOWN:
                    if (grouped.y[(BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameHeight) - BlockModel_1.BlockModel.SIDE_LENGTH] == undefined) {
                        for (let block of this.blocks) {
                            let lineBelow = tetris.lines[block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH];
                            if (lineBelow && lineBelow.blocks[block.x.get()])
                                break outter;
                        }
                        for (let block of this.blocks)
                            block.y.set(block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH);
                        validMove = true;
                    }
                    break;
                case (shared_1.Direction.AUTO_DOWN):
                    while ((this.move(tetris, shared_1.Direction.DOWN))) { }
                    break;
            }
            return validMove;
        }
    }
    exports.PieceModel = PieceModel;
});
