(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../SVGComponent", "./Piece", "./BlockModel", "./shared", "./SquarePieceModel", "./SPieceModel", "./ZPieceBlockModel", "./LPieceModel", "./LongPieceModel", "../Component", "../ModelElement", "../Binding", "./PyramdPieceModel"], function (require, exports) {
    "use strict";
    const SVGComponent_1 = require("../SVGComponent");
    const Piece_1 = require("./Piece");
    const BlockModel_1 = require("./BlockModel");
    const shared_1 = require("./shared");
    const SquarePieceModel_1 = require("./SquarePieceModel");
    const SPieceModel_1 = require("./SPieceModel");
    const ZPieceBlockModel_1 = require("./ZPieceBlockModel");
    const LPieceModel_1 = require("./LPieceModel");
    const LongPieceModel_1 = require("./LongPieceModel");
    const Component_1 = require("../Component");
    const ModelElement_1 = require("../ModelElement");
    const Binding_1 = require("../Binding");
    const PyramdPieceModel_1 = require("./PyramdPieceModel");
    const LEFT_KEYCODE = 37;
    const UP_KEYCODE = 38;
    const RIGHT_KEYCODE = 39;
    const DOWN_KEYCODE = 40;
    const SPACE_KEYCODE = 32;
    class LineModel {
        constructor() {
            this.blocks = {};
        }
        isComplete() {
            for (let x = 0; x < shared_1.gameWidth * BlockModel_1.BlockModel.SIDE_LENGTH; x += BlockModel_1.BlockModel.SIDE_LENGTH)
                if (!this.blocks[x])
                    return false;
            return true;
        }
        clear() {
            for (let x in this.blocks) {
                let block = this.blocks[x];
                block.destroy();
            }
        }
    }
    class TetrisModel {
        constructor() {
            this.message = new ModelElement_1.default();
            this.showMessage = new ModelElement_1.default(false);
            this.paused = new ModelElement_1.default(false);
            this.lineCount = new ModelElement_1.default(0);
            this.score = new ModelElement_1.default(0);
        }
        resetCurrentPiece(tetris) {
            this.currentPiece = new TetrisModel.PIECES[Math.floor((Math.random() * (TetrisModel.PIECES.length)))]((shared_1.gameWidth / 2) - 1, 0);
            for (let block of this.currentPiece.blocks) {
                let line = tetris.lines[block.y.get()];
                if (line && line.blocks[block.x.get()])
                    return false;
            }
            return true;
        }
    }
    TetrisModel.PIECES = [SquarePieceModel_1.SquarePieceModel, SPieceModel_1.SPieceBlockModel, ZPieceBlockModel_1.ZPieceBlockModel, LPieceModel_1.LPieceModel, LongPieceModel_1.LongPieceModel, PyramdPieceModel_1.PyramdPieceModel];
    class Tetris {
        constructor() {
            this.lines = {};
            this.model = new TetrisModel();
            this.model.resetCurrentPiece(this);
            this.lastLine = new LineModel();
            document.addEventListener("keyup", (event) => {
                switch (event.keyCode) {
                    case LEFT_KEYCODE:
                        this.model.currentPiece.move(this, shared_1.Direction.LEFT);
                        break;
                    case RIGHT_KEYCODE:
                        this.model.currentPiece.move(this, shared_1.Direction.RIGHT);
                        break;
                    case DOWN_KEYCODE:
                        this.model.currentPiece.move(this, shared_1.Direction.DOWN);
                        break;
                    case UP_KEYCODE:
                        this.model.currentPiece.rotate();
                        break;
                    case SPACE_KEYCODE:
                        this.model.currentPiece.move(this, shared_1.Direction.AUTO_DOWN);
                        break;
                }
            });
            this.svg = new SVGComponent_1.default("svg")
                .withAttribute("width", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameWidth)
                .withAttribute("height", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameHeight)
                .child(new SVGComponent_1.default("rect")
                .withAttribute("x", 0)
                .withAttribute("y", 0)
                .withAttribute("width", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameWidth)
                .withAttribute("height", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameHeight)
                .withAttribute("style", "fill: #000000;")
                .reinit())
                .reinit();
            new Component_1.default("div", document.getElementById("app-root"))
                .withClass("game")
                .child(new Component_1.default("div")
                .withClass("header")
                .child(new Component_1.default("span")
                .withClass("score"))
                .child(new Component_1.default("span")
                .withText("Start")
                .withClass("btn start")
                .on("click", this.restart.bind(this))
                .reinit(), new Component_1.default("label")
                .withClass("score")
                .withText(this.model.score)
                .reinit(), new Component_1.default("label")
                .withClass("line-count")
                .withText(this.model.lineCount)
                .reinit(), new Component_1.default("span")
                .withText(new Binding_1.Binding(this.model.paused, function (isPaused) {
                return isPaused ? "Resume" : "Pause";
            }))
                .withClass("btn pause")
                .on("click", this.pause.bind(this))
                .reinit()).reinit()
                .child(new Component_1.default("h1")
                .withText(this.model.message)
                .withClass("message", new Binding_1.Binding(this.model.showMessage, function (showing) {
                return showing ? "" : "hidden";
            }))
                .reinit())).reinit()
                .child(this.svg)
                .reinit();
        }
        restart() {
            this.model.showMessage.set(false);
            this.model.score.set(0);
            this.model.lineCount.set(0);
            for (let y in this.lines) {
                let line = this.lines[y];
                if (line !== this.lastLine)
                    this.lines[y].clear();
            }
            this.lines = {};
            this.lines[shared_1.gameHeight * BlockModel_1.BlockModel.SIDE_LENGTH] = this.lastLine;
            this.model.resetCurrentPiece(this);
            this.piece = new Piece_1.Piece(this.model.currentPiece);
            this.addPiece(this.piece);
            this.tick();
        }
        tick() {
            this.timeoutHandle = setTimeout(function () {
                for (let block of this.model.currentPiece.blocks) {
                    if (!this.canFall(block)) {
                        this.releasePiece(this.model.currentPiece);
                        this.updateLines();
                        let gameEnded = !this.model.resetCurrentPiece(this);
                        this.piece = new Piece_1.Piece(this.model.currentPiece);
                        this.addPiece(this.piece);
                        if (gameEnded) {
                            this.endGame();
                            return;
                        }
                        this.tick();
                        return;
                    }
                }
                this.model.currentPiece.move(this, shared_1.Direction.DOWN);
                this.tick();
            }.bind(this), 750);
        }
        pause() {
            if (this.model.paused.get()) {
                this.model.showMessage.set(false);
                this.model.paused.set(false);
                this.tick();
            }
            else {
                this.model.paused.set(true);
                if (this.timeoutHandle != undefined)
                    clearTimeout(this.timeoutHandle);
                this.model.message.set("Paused");
                this.model.showMessage.set(true);
            }
        }
        endGame() {
            this.pause();
            this.model.message.set("Game over");
            this.model.showMessage.set(true);
        }
        updateLines() {
            let moreCompletedLines = false;
            for (let y = shared_1.gameHeight * BlockModel_1.BlockModel.SIDE_LENGTH; y >= 0; y -= BlockModel_1.BlockModel.SIDE_LENGTH) {
                let line = this.lines[y];
                if (line == undefined)
                    break;
                if (line.isComplete()) {
                    this.model.lineCount.set(this.model.lineCount.get() + 1);
                    this.model.score.set(this.model.score.get() + 250);
                    line.clear();
                    this.lines[y] = new LineModel();
                    for (let yAbove = y - BlockModel_1.BlockModel.SIDE_LENGTH; yAbove >= 0; yAbove -= BlockModel_1.BlockModel.SIDE_LENGTH) {
                        let lineAbove = this.lines[yAbove];
                        if (lineAbove == undefined)
                            break;
                        for (let x in lineAbove.blocks) {
                            let block = lineAbove.blocks[x];
                            let yBelow = yAbove + BlockModel_1.BlockModel.SIDE_LENGTH;
                            let swapLine = lineAbove;
                            if (this.canFall(block) && yBelow < shared_1.gameHeight * BlockModel_1.BlockModel.SIDE_LENGTH) {
                                let lineBelow = this.lines[yBelow];
                                block.y.set(block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH);
                                // swap the block between above and below line
                                lineBelow.blocks[x] = block;
                                delete swapLine.blocks[x];
                            }
                        }
                    }
                    // repeat for this line now that it has been swapped
                    y += BlockModel_1.BlockModel.SIDE_LENGTH;
                }
            }
            if (moreCompletedLines)
                this.updateLines();
        }
        addPiece(piece) {
            this.model.score.set(this.model.score.get() + 100);
            this.svg.child(piece.blocks);
        }
        releasePiece(piece) {
            for (let block of piece.blocks) {
                let line = this.lines[block.y.get()];
                if (!line) {
                    line = new LineModel();
                    this.lines[block.y.get()] = line;
                }
                line.blocks[block.x.get()] = block;
            }
        }
        canFall(block) {
            let lineBelow = this.lines[block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH];
            if (!lineBelow)
                return true;
            if (lineBelow === this.lastLine)
                return false;
            return lineBelow.blocks[block.x.get()] == undefined;
        }
    }
    exports.Tetris = Tetris;
    const tetris = new Tetris();
    window["tetris"] = tetris;
});
