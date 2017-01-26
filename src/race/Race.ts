import {
    AnimatableCanvas, CanvasElement, CanvasCollection, StaticCanvasElement,
    DynamicCanvasElement
} from "../AnimatableCanvas";
import {enters, ExtrudeDirection, Line, Intersectable} from "../Intersectable";

const LEFT_KEYCODE = 37;
const UP_KEYCODE = 38;
const RIGHT_KEYCODE = 39;
const DOWN_KEYCODE = 40;
const GAME_HEIGHT = 400;
const GAME_WIDTH = 400;

class Race extends AnimatableCanvas {

    protected static MAX_SPEED = 4;
    protected static FRICTION = 0.1;
    protected static EPSILON = 0.1;

    constructor() {
        super(document.getElementById("app-root"));

        let player = new DynamicCanvasElement(0, 390, 10, 10, function (this: CanvasElement, ctx: CanvasRenderingContext2D): void {
            ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
        });
        player.ay = 1;

        let ground = new StaticCanvasElement(0, GAME_HEIGHT, GAME_WIDTH, 1, function (this: CanvasElement, ctx: CanvasRenderingContext2D): void {
            ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
        }, 0, 0, function (this: StaticCanvasElement, elements: CanvasCollection) {
            let player = elements.dynamic["player"];
            let direction = enters(this as Intersectable, player as Line) as ExtrudeDirection;
            if (direction == ExtrudeDirection.TOP && player.vy >= 0) {
                this.extrude(player, ExtrudeDirection.TOP);
            }
        });

        let platform = new StaticCanvasElement(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH * 0.25, 5, function (this: CanvasElement, ctx: CanvasRenderingContext2D): void {
            ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
        }, 0, 0, function (this: StaticCanvasElement, elements: CanvasCollection) {
            let player = elements.dynamic["player"];
            let direction = enters(this, player as Line) as ExtrudeDirection;
            if (direction == ExtrudeDirection.TOP && player.vy >= 0) {
                this.extrude(player, ExtrudeDirection.TOP);
            }
        });

        window.addEventListener("keydown",function (event: KeyboardEvent) {
            switch (event.keyCode) {
                case UP_KEYCODE:
                    if (player.bounded(ExtrudeDirection.BOTTOM)) {
                        player.vy = -10;
                        player.vy = Math.min(player.vy, -1 * Race.MAX_SPEED);
                    }
                    break;
                case RIGHT_KEYCODE:
                    if (player.bounded(ExtrudeDirection.BOTTOM)) {
                        player.vx += 1;
                        player.vx = Math.min(player.vx, Race.MAX_SPEED);
                    }
                    break;
                case LEFT_KEYCODE:
                    if (player.bounded(ExtrudeDirection.BOTTOM)) {
                        player.vx -= 1;
                        player.vx = Math.max(player.vx, -1 * Race.MAX_SPEED);
                    }
                    break;
            }
        });

        this.withAttribute("width", GAME_HEIGHT)
            .withAttribute("height", GAME_WIDTH)
            .withElement(ground, "ground", 1)
            .withElement(platform, "platform", 1)
            .withElement(player, "player", 0)
            .reinit();
    }

    protected onTic(): void {
        super.onTic();
        for (let element of this.rankedElements) {
            if (element.bounded(ExtrudeDirection.BOTTOM)) {
                if (element.vx > Race.EPSILON)
                    element.ax = Race.FRICTION * -1;
                else if (element.vx < -1 * Race.EPSILON)
                    element.ax = Race.FRICTION;
                else {
                    element.vx = 0;
                    element.ax = 0;
                }
            }
        }
    }
}

window["Race"] = new Race();



