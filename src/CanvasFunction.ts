import {FunctionalElement} from "./FunctionalComponent";
import {CanvasComponent} from "./CanvasComponent";
import ModelElement from "./ModelElement";
import {AbstractElement} from "./AbstractElement";

export type DrawHandler = (this: CanvasRenderingContext2D, ...models: any[]) => void;

export abstract class CanvasFunction extends FunctionalElement<void> {

    protected canvasComponent: CanvasComponent;
    protected drawHandlers: Array<DrawHandler> = [];
    readonly x: ModelElement<number>;
    readonly y: ModelElement<number>;

    constructor(initX = 0, initY = 0, drawHandler: DrawHandler, ...listenedTo: AbstractElement<any>[]) {
        super(() => {
            if (this.canvasComponent) {
                this.canvasComponent.getContext().setTransform(1,0,0,1,0,0);
                this.canvasComponent.getContext().translate(this.x.get(), this.y.get());
                drawHandler.apply(this.canvasComponent.getContext(), this.listenedTo.map(function (model: ModelElement<any>) {
                    return model.get();
                }));
            }
        });
        this.x = new ModelElement<number>(initX);
        this.y = new ModelElement<number>(initY);
        for (let model of listenedTo) {
            this.listenedTo.push(model);
        }
        this.drawHandlers.push(drawHandler);
    }

    // implementing classes should call this after adding their listenedTos
    protected postConstruct(): void {
        for (let model of this.listenedTo)
            model.registerCallback(model, this.doUpdate.bind(this));
    }

    get(): void {
        this.handler.apply(this, this.listenedTo.map(function (model: ModelElement<any>) {
            return model.get();
        }));
    }

    bindCanvas(canvasComponent: CanvasComponent): void {
        this.canvasComponent = canvasComponent;
    }

    unbindCanvas(): void {
        this.canvasComponent = null;
    }

    protected doUpdate(): void {
        if (this.canvasComponent)
            this.canvasComponent.reinit();
    }
}