import {AbstractElement} from "./AbstractElement";
import ModelElement from "./ModelElement";

export class FunctionalElement<V> extends AbstractElement<V> {

    protected readonly handler: (...models: ModelElement<any>[]) => V;
    protected readonly listenedTo: AbstractElement<any>[];

    constructor(handler: (...models: any[]) => V, ...listenedTo: AbstractElement<any>[]) {
        super();
        this.handler = handler;
        this.listenedTo = listenedTo;
        for (let model of this.listenedTo)
            model.registerCallback(model, this.doUpdate.bind(this));
    }

    get(): V {
        return this.handler.apply(this.handler, this.listenedTo.map(function (model: ModelElement<any>) {
            return model.get();
        }));
    }
}