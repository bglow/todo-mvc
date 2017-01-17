import SVGComponent from "../SVGComponent";
import {Piece} from "./Piece";
import {PieceModel} from "./PieceModel";
import {BlockModel} from "./BlockModel";
import {gameWidth, Direction, gameHeight} from "./shared";
import {SquarePieceModel} from "./SquarePieceModel";
import {SPieceBlockModel} from "./SPieceModel";
import {ZPieceBlockModel} from "./ZPieceBlockModel";
import {LPieceModel} from "./LPieceModel";
import {LongPieceModel} from "./LongPieceModel";
import Component from "../Component";
import ModelElement from "../ModelElement";
import {Binding} from "../Binding";
import {PyramdPieceModel} from "./PyramdPieceModel";
import {FunctionalElement} from "../FunctionalComponent";

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
    readonly blocks: {[x: number]: BlockModel} = {};
    isComplete(): boolean {
        for (let x = 0; x < gameWidth * BlockModel.SIDE_LENGTH; x += BlockModel.SIDE_LENGTH)
            if (!this.blocks[x]) return false;
        return true;
    }
    clear(): void {
        for (let x in this.blocks) {
            let block = this.blocks[x];
            block.destroy();
        }
    }
}

enum State {
    INIT,
    IN_PROGRESS,
    PAUSED,
    GAMEOVER
}

class TetrisModel {
    currentPiece: PieceModel;
    readonly message = new ModelElement<string>();
    readonly showMessage = new ModelElement<boolean>(false);
    readonly state = new ModelElement<State>(State.INIT);
    readonly score = new ModelElement<number>(0);
    readonly pieceCount = new ModelElement<number>(0);
    readonly level: FunctionalElement<number>;
    readonly lineCount = new ModelElement<number>(0);
    readonly tickLength: FunctionalElement<number>;

    constructor() {
        this.level = new FunctionalElement<number>(function (pieceCount: number) {
            return Math.ceil((pieceCount + 1) / PIECES_PER_LEVEL);
        }, this.pieceCount);
        this.tickLength = new FunctionalElement<number>(function (level: number) {
            return 1000 / Math.log2(level + 1);
        }, this.level);
    }

    protected static PIECES = [SquarePieceModel, SPieceBlockModel, ZPieceBlockModel, LPieceModel, LongPieceModel, PyramdPieceModel];

    resetCurrentPiece(tetris: Tetris): boolean {
        this.currentPiece = new TetrisModel.PIECES[Math.floor((Math.random() * (TetrisModel.PIECES.length)))]((gameWidth / 2) -1, 0);
        for (let block of this.currentPiece.blocks) {
            let line = tetris.lines[block.y.get()];
            if (line && line.blocks[block.x.get()])
                return false;
        }
        return true;
    }
}

export class Tetris {
    protected piece: Piece;
    readonly model: TetrisModel;
    readonly svg: SVGComponent;
    lines: {[y: number]: LineModel} = {};
    protected lastLine;
    protected timeoutHandle: number;

    constructor() {
        this.model = new TetrisModel();
        this.model.resetCurrentPiece(this);
        this.lastLine = new LineModel();

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            let state = this.model.state.get();
            switch (event.keyCode) {
                case LEFT_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, Direction.LEFT);
                    break;
                case RIGHT_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, Direction.RIGHT);
                    break;
                case DOWN_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, Direction.DOWN);
                    break;
                case UP_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.rotate();
                    break;
                case SPACE_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, Direction.AUTO_DOWN);
                    break;
                case P_KEYCODE:
                    this.pause();
                    break;
                // case S_KEYCODE:
                //     this.restart();
                //     break;
            }
        });
        this.svg = new SVGComponent("svg")
            .withAttribute("width",BlockModel.SIDE_LENGTH * gameWidth)
            .withAttribute("height",BlockModel.SIDE_LENGTH * gameHeight)
            .child(
                new SVGComponent("rect")
                    .withAttribute("x",0)
                    .withAttribute("y",0)
                    .withAttribute("width",BlockModel.SIDE_LENGTH * gameWidth)
                    .withAttribute("height",BlockModel.SIDE_LENGTH * gameHeight)
                    .withAttribute("style","fill: #000000;")
                    .reinit()
            )
            .reinit();
        new Component("div", document.getElementById("app-root"))
            .withClass("game")
            .child (new Component ("div")
                .withClass("header")
                .child(
                    new Component("span")
                        .withClass("score")
                )
                .child(
                    new Component("span")
                        .withText("Start")
                        .withClass(
                            "btn start",
                            new Binding<State,string>(this.model.state, function (state: State): string {
                                return state == State.INIT || state == State.GAMEOVER ? "" : "hidden";
                            })
                        ).on("click", this.restart.bind(this))
                        .reinit(),
                    new Component("span")
                        .withClass("level", new Binding<State,string>(this.model.state, function (state: State): string {
                            return state == State.INIT || state == State.GAMEOVER ? "hidden" : "";
                        }))
                        .withText(new Binding<number,string>(this.model.level, function (level: number) {
                            return "Level " + level;
                        }))
                        .reinit(),
                    new Component("label")
                        .withClass("score")
                        .withText(this.model.score)
                        .reinit(),
                    new Component("label")
                        .withClass("line-count")
                        .withText(this.model.lineCount)
                        .reinit(),
                    new Component("span")
                        .withText(new Binding<State, string>(this.model.state, function (state: State) {
                            return state == State.PAUSED ? "Resume" : "Pause"
                        }))
                        .withClass("btn pause")
                        .on("click", this.pause.bind(this))
                        .reinit()
                ).reinit()
                .child(
                    new Component("h1")
                        .withText(this.model.message)
                        .withClass("message", new Binding<boolean,string>(this.model.showMessage, function (showing: boolean) {
                            return showing ? "" : "hidden";
                        }))
                        .reinit()
                )
            ).reinit()
            .child(this.svg)
            .reinit();
    }

    protected restart(): void {
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
        this.lines[gameHeight * BlockModel.SIDE_LENGTH] = this.lastLine;
        this.model.resetCurrentPiece(this);
        this.piece = new Piece(this.model.currentPiece);
        this.addPiece(this.piece);
        this.tick();
    }

    protected tick() {
        this.timeoutHandle = setTimeout(function () {
            for (let block of this.model.currentPiece.blocks) {
                if (!this.canFall(block)) {
                    this.releasePiece(this.model.currentPiece);
                    this.updateLines();
                    let gameEnded = !this.model.resetCurrentPiece(this);
                    this.piece = new Piece(this.model.currentPiece);
                    this.addPiece(this.piece);
                    if (gameEnded) {
                        this.endGame();
                        return;
                    }
                    this.tick();
                    return;
                }
            }
            this.model.currentPiece.move(this, Direction.DOWN);
            this.tick();
        }.bind(this),this.model.tickLength.get());
    }

    protected pause() {
        let state = this.model.state.get();
        if (state == State.INIT || state == State.GAMEOVER)
            return;

        if (this.model.state.get() == State.PAUSED) {
            this.model.showMessage.set(false);
            this.model.state.set(State.IN_PROGRESS);
            this.tick();
        } else {
            this.model.state.set(State.PAUSED);
            if (this.timeoutHandle != undefined)
                clearTimeout(this.timeoutHandle);
            this.model.message.set("Paused");
            this.model.showMessage.set(true);
        }
    }

    endGame(): void {
        this.model.state.set(State.GAMEOVER);
        if (this.timeoutHandle != undefined)
            clearTimeout(this.timeoutHandle);
        this.model.message.set("Game over");
        this.model.showMessage.set(true);
    }

    private updateLines(): void {
        let lines = 0;
        for (let y = gameHeight * BlockModel.SIDE_LENGTH; y >= 0; y -= BlockModel.SIDE_LENGTH) {
            let line = this.lines[y];
            if (line == undefined)
                break;
            if (line.isComplete()) {
                lines++;
                this.model.lineCount.set(this.model.lineCount.get() + 1);
                this.model.score.set(this.model.score.get() + 250);
                line.clear();
                this.lines[y] = new LineModel();
                for (let yAbove = y - BlockModel.SIDE_LENGTH; yAbove >= 0; yAbove -= BlockModel.SIDE_LENGTH) {
                    let lineAbove = this.lines[yAbove];
                    if (lineAbove == undefined)
                        break;
                    for (let x in lineAbove.blocks) {
                        let block = lineAbove.blocks[x];
                        let yBelow = yAbove + BlockModel.SIDE_LENGTH;
                        let swapLine = lineAbove;
                        if(this.canFall(block) && yBelow < gameHeight * BlockModel.SIDE_LENGTH) {
                            let lineBelow = this.lines[yBelow];
                            block.y.set(block.y.get() + BlockModel.SIDE_LENGTH);
                            // swap the block between above and below line
                            lineBelow.blocks[x] = block;
                            delete swapLine.blocks[x];
                        }
                    }
                }
                // repeat for this line now that it has been swapped
                y += BlockModel.SIDE_LENGTH;
            }
        }
        this.model.score.set(this.model.score.get() + ((POINTS_PER_LINE * Math.pow(LEVEL_MULTIPLIER, this.model.level.get() - 1))) * Math.pow(LINE_MULTIPLIER, this.model.level.get() -1));
    }

    addPiece(piece: Piece): void {
        this.model.pieceCount.set(this.model.pieceCount.get() + 1);
        this.model.score.set(this.model.score.get() + (POINTS_PER_PIECE * Math.pow(LEVEL_MULTIPLIER, this.model.level.get())));
        this.svg.child(piece.blocks);
    }

    releasePiece(piece: PieceModel): void {
        for (let block of piece.blocks) {
            let line = this.lines[block.y.get()];
            if (!line) {
                line = new LineModel();
                this.lines[block.y.get()] = line;
            }
            line.blocks[block.x.get()] = block;
        }
    }

    canFall(block: BlockModel): boolean {
        let lineBelow = this.lines[block.y.get() + BlockModel.SIDE_LENGTH];
        if (!lineBelow)
            return true;
        if (lineBelow === this.lastLine)
            return false;
        return lineBelow.blocks[block.x.get()] == undefined;
    }
}

const tetris = new Tetris();

window["tetris"] = tetris;