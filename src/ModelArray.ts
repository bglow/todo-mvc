import {ModelCollection} from "./ModelCollection";
import ModelElement from "./ModelElement";
import {AbstractComponent} from "./AbstractComponent";
import {UpdateCallback} from "./Binding";
import Collection from "./Collection";
export default class ModelArray<M> extends ModelCollection<M,Array<ModelElement<M>>> {

    readonly size = new ModelElement<number>(0);

    constructor(data?: Array<M>) {
        super([]);
        if (data) {
            for (let item of data) {
                this.add(item);
            }
        }
    }

    add(member: M): this {
        if (!this.addCallbacks)
            this.addCallbacks = new Map<Collection,Set<UpdateCallback<ModelElement<M>,AbstractComponent>>>();

        let newMember = new ModelElement<M>(member);
        this.data.push(newMember);
        for (let callbackSet of this.addCallbacks.values()) {
            for (let callback of callbackSet.values()) {
                callback(newMember);
            }
        }
        this.size.set(this.size.get() + 1);
        return this;
    }

    remove(member: ModelElement<M>): this {
        let index = this.data.indexOf(member);
        if (index !== -1) {
            member.destroy();
            this.data.splice(index, 1);
        }
        this.size.set(this.size.get() - 1);
        return this;
    }
}