import Component from "./Component";
import {HtmlTagName} from "./Html";
export default class SVGComponent extends Component {
    constructor(tagName: HtmlTagName, parent?: Element) {
        super(tagName, parent, "http://www.w3.org/2000/svg");
    }

    withClass(...classes): this {
        throw new Error("Cannot apply class to SVG element. Classname is readonly");
    }
}