(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../AnimatableCanvas", "../Intersectable"], function (require, exports) {
    "use strict";
    const AnimatableCanvas_1 = require("../AnimatableCanvas");
    const Intersectable_1 = require("../Intersectable");
    const LEFT_KEYCODE = 37;
    const UP_KEYCODE = 38;
    const RIGHT_KEYCODE = 39;
    const DOWN_KEYCODE = 40;
    const GAME_HEIGHT = 400;
    const GAME_WIDTH = 400;
    class Race extends AnimatableCanvas_1.AnimatableCanvas {
        constructor() {
            super(document.getElementById("app-root"));
            let player = new AnimatableCanvas_1.DynamicCanvasElement(0, 390, 10, 10, function (ctx) {
                ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
            });
            player.ay = 1;
            let ground = new AnimatableCanvas_1.StaticCanvasElement(0, GAME_HEIGHT, GAME_WIDTH, 1, function (ctx) {
                ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
            }, 0, 0, function (elements) {
                let player = elements.dynamic["player"];
                let direction = Intersectable_1.enters(this, player);
                if (direction == Intersectable_1.ExtrudeDirection.TOP && player.vy >= 0) {
                    this.extrude(player, Intersectable_1.ExtrudeDirection.TOP);
                }
            });
            let platform = new AnimatableCanvas_1.StaticCanvasElement(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH * 0.25, 5, function (ctx) {
                ctx.strokeRect(this.x.get(), this.y.get(), this.w.get(), this.h.get());
            }, 0, 0, function (elements) {
                let player = elements.dynamic["player"];
                let direction = Intersectable_1.enters(this, player);
                if (direction == Intersectable_1.ExtrudeDirection.TOP && player.vy >= 0) {
                    this.extrude(player, Intersectable_1.ExtrudeDirection.TOP);
                }
            });
            window.addEventListener("keydown", function (event) {
                switch (event.keyCode) {
                    case UP_KEYCODE:
                        if (player.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
                            player.vy = -10;
                            player.vy = Math.min(player.vy, -1 * Race.MAX_SPEED);
                        }
                        break;
                    case RIGHT_KEYCODE:
                        if (player.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
                            player.vx += 1;
                            player.vx = Math.min(player.vx, Race.MAX_SPEED);
                        }
                        break;
                    case LEFT_KEYCODE:
                        if (player.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
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
        onTic() {
            super.onTic();
            for (let element of this.rankedElements) {
                if (element.bounded(Intersectable_1.ExtrudeDirection.BOTTOM)) {
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
    Race.MAX_SPEED = 4;
    Race.FRICTION = 0.1;
    Race.EPSILON = 0.1;
    window["Race"] = new Race();
});
