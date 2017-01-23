import {CanvasFunction, DrawHandler} from "../CanvasFunction";
import {AbstractElement} from "../AbstractElement";
import {Intersectable, StaticLine, ExtrudeDirection, DynamicPoint, enters} from "../Intersectable";

export abstract class MoveableModel extends CanvasFunction implements Intersectable {
    static FRAME_LENGTH = 1000 / 24;
    readonly gravity: number;
    readonly friction: number;
    private _jump_flag = false;
    protected entersCallbacks = new Map<Intersectable,Function>();

    constructor(initX: number, initY: number, gravity = 1, friction = 1, drawHandler: DrawHandler, ...listenedTo: AbstractElement<any>[]) {
        super(initX, initY, drawHandler);
        for (let model of listenedTo) {
            this.listenedTo.push(model);
        }
        this.gravity = gravity;
        this.friction = friction;
    }

    abstract dynamicPoints(): DynamicPoint[];
    abstract lines(): StaticLine[];

    onEnters(other: Intersectable, callback: (extrudeDirection: ExtrudeDirection) => boolean | void): this {
        this.entersCallbacks.set(other, callback);
        return this;
    }

    protected checkEnters(): boolean {
        let cancel = false;
        for (let entry of this.entersCallbacks.entries()) {
            let other = entry[0];
            let callback = entry[1];
            let extrudes = enters(other,this);
            if (extrudes) {
                if (callback(extrudes))
                    cancel = true;
            }
        }
        return cancel;
    }

    jump(strength: number): void {
        if (this._jump_flag) return;
        this._jump_flag = true;
        let t = 1;
        let yInit = this.y.get();
        let update = () => {
            let yp = yInit - strength * t + this.gravity * Math.pow(t,2);
            if (yp < yInit) {
                this.y.set(yp);
                console.log(t,this.y.get());
                t++;
                if(this.checkEnters()) {
                    this._jump_flag = false;
                    return;
                }
                setTimeout(update, MoveableModel.FRAME_LENGTH);
            } else {
                this.y.set(yInit);
                this.checkEnters();
                this._jump_flag = false;
            }
        };
        update();
    }

    right(): void {
        let progress = 10 / this.friction;
        let maxT = 10;
        let t = 0;
        let xInit = this.x.get();
        let update = () => {
            this.x.set(xInit + progress * t);
            t++;
            if (t <= (maxT / 2)) {
                if(this.checkEnters())
                    return;
                setTimeout(update, MoveableModel.FRAME_LENGTH);
            }
        };
        update();
    }

    left(): void {
        let progress = 10 / this.friction;
        let maxT = 10;
        let t = 0;
        let xInit = this.x.get();
        let update = () => {
            this.x.set(xInit - progress * t);
            t++;
            if (t <= (maxT / 2)) {
                if(this.checkEnters())
                    return;
                setTimeout(update, MoveableModel.FRAME_LENGTH);
            }
        };
        update();
    }
}