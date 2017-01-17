import {AbstractComponent} from "./AbstractComponent";
import {UpdateCallback} from "./Binding";

export abstract class AbstractElement<V> {
    protected updateCallbacks: Map<AbstractComponent | AbstractElement<any>, Set<UpdateCallback<V,any>>>;
    protected boundComponents: Set<AbstractComponent>;

    abstract get(): V;

    destroy(): void {
        if (!this.boundComponents)
            return;
        for (let component of this.boundComponents.values())
            component.destroy();
    }

    bindComponent(component: AbstractComponent): void {
        if (!this.boundComponents) {
            this.boundComponents = new Set();
        }
        this.boundComponents.add(component);
    }

    registerCallback(component: AbstractComponent | AbstractElement<any>, updateCallback: UpdateCallback<any,any>): void {
        if (!this.updateCallbacks)
            this.updateCallbacks = new Map();

        let callbackSet = this.updateCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set<UpdateCallback<V,any>>();
            this.updateCallbacks.set(component, callbackSet);
        }
        callbackSet.add(updateCallback);
    }

    unregisterCallback(component: AbstractComponent | AbstractElement<any>, callback?: UpdateCallback<any,any>): void {
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

    protected doUpdate(): void {
        if (!this.updateCallbacks)
            return;
        for (let callbackSet of this.updateCallbacks.values()) {
            for (let callback of callbackSet.values())
                callback(this.get());
        }
    }
}