import {AbstractComponent} from "./AbstractComponent";

export default class Component extends AbstractComponent {
    child(...components: AbstractComponent[]): this {
        for (let component of components) {
            component.setParent(this);
            this.element.appendChild(component.getElement());
        }
        return this;
    }
}