import {AbstractComponent} from "./AbstractComponent";
import {CanvasFunction} from "./CanvasFunction";

export class CanvasComponent extends AbstractComponent {

    constructor(parent?: Element) {
        super("canvas", parent);
    }

    getContext(): CanvasRenderingContext2D {
        return (this.element as HTMLCanvasElement).getContext('2d');
    }

    protected canvasFunctions: CanvasFunction[] = [];

    withDrawFunction(canvasFunction: CanvasFunction): this {
        this.canvasFunctions.push(canvasFunction);
        canvasFunction.bindCanvas(this);
        return this;
    }

    reinit(): this {
        super.reinit();
        // clear the canvas before redrawing
        this.getContext()
            .clearRect(0, 0, (this.getElement() as HTMLCanvasElement).width, (this.getElement() as HTMLCanvasElement).height);
        for (let canvasFunction of this.canvasFunctions)
            canvasFunction.get();
        return this;
    }
}