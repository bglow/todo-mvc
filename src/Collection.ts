import {AbstractComponent} from "./AbstractComponent";
import {UpdateCallback} from "./Binding";
import ModelElement from "./ModelElement";
import {ModelCollection} from "./ModelCollection";

export default class Collection extends AbstractComponent {

    children<M>(model: ModelCollection<M,any>, onAddCallback: UpdateCallback<ModelElement<M>,AbstractComponent>): this {
        model.registerAddCallback(this, function (newItem: ModelElement<any>) {
            let newComponent = onAddCallback(newItem);
            newItem.bindComponent(newComponent);
            this.element.appendChild(newComponent.getElement());
        }.bind(this));
        return this;
    }

}