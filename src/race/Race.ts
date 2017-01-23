import {CanvasComponent} from "../CanvasComponent";
import ModelElement from "../ModelElement";
import {MoveableModel} from "./Moveable";
import {StaticLine, ExtrudeDirection, DynamicPoint, Extrudable} from "../Intersectable";
import {FunctionalElement} from "../FunctionalComponent";

const LEFT_KEYCODE = 37;
const UP_KEYCODE = 38;
const RIGHT_KEYCODE = 39;
const DOWN_KEYCODE = 40;
const GAME_HEIGHT = 400;
const GAME_WIDTH = 400;

class PlayerModel extends MoveableModel implements Extrudable {
    readonly width: ModelElement<number>;
    readonly height: ModelElement<number>;
    protected _lines: StaticLine[];
    protected _points: DynamicPoint[];

    constructor(initX: number, initY: number, width: number, height: number, gravity?: number, friction? : number) {
        super(initX, initY, gravity, friction, function (this: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
            let ctx = this as CanvasRenderingContext2D;
            ctx.strokeRect(0, 0, width, height);
        });
        this.width = new ModelElement<number>(width);
        this.height = new ModelElement<number>(height);
        this.listenedTo.push(this.x, this.y, this.width, this.height);
        let pNW = new DynamicPoint(
            new FunctionalElement((x: number): number => {
                return x;
            }, this.x),
            new FunctionalElement((y: number): number => {
                return y;
            }, this.y)
        );
        let pSE = new DynamicPoint(
            new FunctionalElement((x: number, width: number): number => {
                return x + width;
            }, this.x, this.width),
            new FunctionalElement((y: number, height: number): number => {
                return y + height;
            }, this.y, this.height)
        );
        let pSW = new DynamicPoint(
            new FunctionalElement((x: number): number => {
                return x;
            }, this.x),
            new FunctionalElement((y: number, height: number): number => {
                return y + height;
            }, this.y, this.height)
        );
        let pNE = new DynamicPoint(
            new FunctionalElement((x: number, width: number): number => {
                return x + width;
            }, this.x, this.width),
            new FunctionalElement((y: number): number => {
                return y;
            }, this.y)
        );
        this._points = [pNW,pSE,pSW,pNE];
        this._lines = [new StaticLine(pNW,pSE), new StaticLine(pSW,pNE)];
        this.postConstruct();
    }

    lines(): StaticLine[] {
        return this._lines;
    }

    dynamicPoints(): DynamicPoint[] {
        return this._points;
    }

    extrude(direction: ExtrudeDirection): {x: number; y: number} {
        switch (direction) {
            case ExtrudeDirection.LEFT:
            case ExtrudeDirection.TOP:
                return { x: this.x.get() - 1, y: this.y.get() - 1 };
            case ExtrudeDirection.RIGHT:
                return { x: this.x.get() + this.width.get() + 1, y: this.y.get() - 1 };
            case ExtrudeDirection.BOTTOM:
                return { x: this.x.get() + this.width.get() + 1, y: this.y.get() + this.height.get() + 1 };
        }
    }
}

// init the Player in the lower left corner
let playerModel = new PlayerModel(0, 390, 10, 10, 1, 2);
let otherPlayerModel = new PlayerModel(100, 380, 21, 21, 1, 2);
playerModel.onEnters(otherPlayerModel, function (extrudeDirection: ExtrudeDirection) {
    console.log("bidi!",ExtrudeDirection[extrudeDirection]);
    let extrudePosition = otherPlayerModel.extrude(extrudeDirection);
    switch (extrudeDirection) {
        case ExtrudeDirection.LEFT:
            playerModel.x.set(extrudePosition.x - playerModel.width.get());
            break;
        case ExtrudeDirection.RIGHT:
            playerModel.x.set(extrudePosition.x);
            break;
        case ExtrudeDirection.TOP:
            playerModel.y.set(extrudePosition.y - playerModel.height.get());
            break;
        case ExtrudeDirection.BOTTOM:
            playerModel.y.set(extrudePosition.y);
            break;
    }

    return true;
});

new CanvasComponent(document.getElementById("app-root"))
    .withAttribute("width", GAME_HEIGHT)
    .withAttribute("height", GAME_WIDTH)
    .withDrawFunction(playerModel)
    .withDrawFunction(otherPlayerModel)
    .reinit();

window.addEventListener("keydown",function (event: KeyboardEvent) {
    switch (event.keyCode) {
        case UP_KEYCODE:
            playerModel.jump(25);
            break;
        case RIGHT_KEYCODE:
            playerModel.right();
            break;
        case LEFT_KEYCODE:
            playerModel.left();
            break;
    }
});

window["playerModel"] = playerModel;

