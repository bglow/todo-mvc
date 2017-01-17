(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../SVGComponent", "./Piece", "./BlockModel", "./shared", "./SquarePieceModel", "./SPieceModel", "./ZPieceBlockModel", "./LPieceModel", "./LongPieceModel", "../Component", "../ModelElement", "../Binding", "./PyramdPieceModel", "../FunctionalComponent"], function (require, exports) {
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
    const FunctionalComponent_1 = require("../FunctionalComponent");
    const LEFT_KEYCODE = 37;
    const UP_KEYCODE = 38;
    const RIGHT_KEYCODE = 39;
    const DOWN_KEYCODE = 40;
    const SPACE_KEYCODE = 32;
    const P_KEYCODE = 80;
    const S_KEYCODE = 83;
    const PIECES_PER_LEVEL = 100;
    const POINTS_PER_PIECE = 1;
    const LEVEL_MULTIPLIER = 2;
    const POINTS_PER_LINE = 10;
    const LINE_MULTIPLIER = 2;
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
    var State;
    (function (State) {
        State[State["INIT"] = 0] = "INIT";
        State[State["IN_PROGRESS"] = 1] = "IN_PROGRESS";
        State[State["PAUSED"] = 2] = "PAUSED";
        State[State["GAMEOVER"] = 3] = "GAMEOVER";
    })(State || (State = {}));
    class TetrisModel {
        constructor() {
            this.message = new ModelElement_1.default();
            this.showMessage = new ModelElement_1.default(false);
            this.state = new ModelElement_1.default(State.INIT);
            this.score = new ModelElement_1.default(0);
            this.pieceCount = new ModelElement_1.default(0);
            this.lineCount = new ModelElement_1.default(0);
            this.level = new FunctionalComponent_1.FunctionalElement(function (pieceCount) {
                return Math.ceil((pieceCount + 1) / PIECES_PER_LEVEL);
            }, this.pieceCount);
            this.tickLength = new FunctionalComponent_1.FunctionalElement(function (level) {
                return 1000 / Math.log2(level + 1);
            }, this.level);
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
                let state = this.model.state.get();
                switch (event.keyCode) {
                    case LEFT_KEYCODE:
                        if (state == State.IN_PROGRESS)
                            this.model.currentPiece.move(this, shared_1.Direction.LEFT);
                        break;
                    case RIGHT_KEYCODE:
                        if (state == State.IN_PROGRESS)
                            this.model.currentPiece.move(this, shared_1.Direction.RIGHT);
                        break;
                    case DOWN_KEYCODE:
                        if (state == State.IN_PROGRESS)
                            this.model.currentPiece.move(this, shared_1.Direction.DOWN);
                        break;
                    case UP_KEYCODE:
                        if (state == State.IN_PROGRESS)
                            this.model.currentPiece.rotate();
                        break;
                    case SPACE_KEYCODE:
                        if (state == State.IN_PROGRESS)
                            this.model.currentPiece.move(this, shared_1.Direction.AUTO_DOWN);
                        break;
                    case P_KEYCODE:
                        this.pause();
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
                .withClass("btn start", new Binding_1.Binding(this.model.state, function (state) {
                return state == State.INIT || state == State.GAMEOVER ? "" : "hidden";
            })).on("click", this.restart.bind(this))
                .reinit(), new Component_1.default("span")
                .withClass("level", new Binding_1.Binding(this.model.state, function (state) {
                return state == State.INIT || state == State.GAMEOVER ? "hidden" : "";
            }))
                .withText(new Binding_1.Binding(this.model.level, function (level) {
                return "Level " + level;
            }))
                .reinit(), new Component_1.default("label")
                .withClass("score")
                .withText(this.model.score)
                .reinit(), new Component_1.default("label")
                .withClass("line-count")
                .withText(this.model.lineCount)
                .reinit(), new Component_1.default("span")
                .withText(new Binding_1.Binding(this.model.state, function (state) {
                return state == State.PAUSED ? "Resume" : "Pause";
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
            if (this.timeoutHandle)
                clearTimeout(this.timeoutHandle);
            this.model.state.set(State.IN_PROGRESS);
            if (this.model.currentPiece) {
                for (let block of this.model.currentPiece.blocks)
                    block.destroy();
            }
            this.model.showMessage.set(false);
            this.model.score.set(0);
            this.model.lineCount.set(0);
            this.model.pieceCount.set(0);
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
            }.bind(this), this.model.tickLength.get());
        }
        pause() {
            let state = this.model.state.get();
            if (state == State.INIT || state == State.GAMEOVER)
                return;
            if (this.model.state.get() == State.PAUSED) {
                this.model.showMessage.set(false);
                this.model.state.set(State.IN_PROGRESS);
                this.tick();
            }
            else {
                this.model.state.set(State.PAUSED);
                if (this.timeoutHandle != undefined)
                    clearTimeout(this.timeoutHandle);
                this.model.message.set("Paused");
                this.model.showMessage.set(true);
            }
        }
        endGame() {
            this.model.state.set(State.GAMEOVER);
            if (this.timeoutHandle != undefined)
                clearTimeout(this.timeoutHandle);
            this.model.message.set("Game over");
            this.model.showMessage.set(true);
        }
        updateLines() {
            let lines = 0;
            for (let y = shared_1.gameHeight * BlockModel_1.BlockModel.SIDE_LENGTH; y >= 0; y -= BlockModel_1.BlockModel.SIDE_LENGTH) {
                let line = this.lines[y];
                if (line == undefined)
                    break;
                if (line.isComplete()) {
                    lines++;
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
            this.model.score.set(this.model.score.get() + ((POINTS_PER_LINE * Math.pow(LEVEL_MULTIPLIER, this.model.level.get() - 1))) * Math.pow(LINE_MULTIPLIER, this.model.level.get() - 1));
        }
        addPiece(piece) {
            this.model.pieceCount.set(this.model.pieceCount.get() + 1);
            this.model.score.set(this.model.score.get() + (POINTS_PER_PIECE * Math.pow(LEVEL_MULTIPLIER, this.model.level.get())));
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
