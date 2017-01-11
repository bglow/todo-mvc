import {UpdateCallback} from "./Binding";
import {AbstractComponent} from "./AbstractComponent";

export default class ModelElement<V> {
    protected data: V;
    protected updateCallbacks: Map<AbstractComponent,Set<UpdateCallback<V,any>>>;
    protected boundComponents: Set<AbstractComponent>;

    constructor(data?: V) {
        this.data = data;
    }

    get(): V {
        return this.data;
    }

    set(data: V, doUpdate = true): void {
        this.data = data;
        if (doUpdate)
            this.doUpdate();
    }

    destroy(): void {
        for (let component of this.boundComponents.values())
            component.destroy();
    }

    protected doUpdate(): void {
        if (!this.updateCallbacks)
            return;
        for (let callbackSet of this.updateCallbacks.values()) {
            for (let callback of callbackSet.values())
                callback(this.data);
        }
    }

    bindComponent(component: AbstractComponent): void {
        if (!this.boundComponents) {
            this.boundComponents = new Set();
        }
        this.boundComponents.add(component);
    }

    registerCallback(component: AbstractComponent, updateCallback: UpdateCallback<any,any>): void {
        if (!this.updateCallbacks)
            this.updateCallbacks = new Map();

        let callbackSet = this.updateCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set<UpdateCallback<V,any>>();
            this.updateCallbacks.set(component, callbackSet);
        }
        callbackSet.add(updateCallback);
    }

    unregisterCallback(component: AbstractComponent, callback?: UpdateCallback<any,any>): void {
        if (!this.updateCallbacks)
            return;

        if (!callback)
            this.updateCallbacks.delete(component);
        else if (this.updateCallbacks.has(component)) {
            let set = this.updateCallbacks.get(component);
            if (set)
                set.delete(callback);
        }

    }
}