import SVGComponent from "../SVGComponent";
import ModelElement from "../ModelElement";
import ModelArray from "../ModelArray";
import {ComponentProperty} from "../Binding";
import {SVGCollection} from "../SVGCollection";

export class ChartDataPoint {
    readonly y: ModelElement<number>;

    constructor(y: number) {
        this.y = new ModelElement<number>(y);
    }
}

export class LabeledChartDataPoint extends ChartDataPoint {
    readonly label: string;
}

export class ChartAxis extends SVGComponent {

}

export class ChartModel<C extends ChartDataPoint> {
    readonly width: ModelElement<number>;
    readonly height: ModelElement<number>;
    readonly data: ModelArray<C>;

    constructor(width: number, height: number, data?: Array<C>) {
        this.width = new ModelElement(width);
        this.height = new ModelElement(height);
        this.data = new ModelArray<C>(data || []);
    }

    reload(data: Array<C>): void {

    }
}

export class ChartComponent extends SVGComponent{

    readonly xAxis: ChartAxis;
    readonly yAxis: ChartAxis;
    readonly title: ComponentProperty<string>;
    readonly data: ModelArray<ChartDataPoint>;

    constructor(parent: Element) {
        super("svg", parent);
    }

}

const model: ChartModel<ChartDataPoint> = new ChartModel<ChartDataPoint>(300, 200);

new ChartComponent(document.getElementById("app-root"))
    .withWidth(model.width)
    .withHeight(model.height)
    .withClass('chart')
    .child(
        new SVGComponent("rect")
            .withWidth(model.width)
            .withHeight(model.height)
            .withClass('perimeter')
            .reinit(),
        new SVGCollection("g")
            .children(model.data, function (entry: ModelElement<ChartDataPoint>, i: number): SVGComponent {
                return new SVGComponent("rect")
                    .withX(i * 7)
                    .withHeight(entry.get().y)
                    .withWidth(5)
                    .withClass("bar")
                    .reinit();
            })
            .reinit()
    ).reinit();

window["model"] = model;

model.data.add(new ChartDataPoint(10));
model.data.add(new ChartDataPoint(12));
model.data.add(new ChartDataPoint(14));
model.data.add(new ChartDataPoint(18));

window["ChartDataPoint"] = ChartDataPoint;