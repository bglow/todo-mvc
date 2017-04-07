(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../SVGComponent", "../ModelElement", "../ModelArray", "../SVGCollection"], factory);
    }
})(function (require, exports) {
    "use strict";
    const SVGComponent_1 = require("../SVGComponent");
    const ModelElement_1 = require("../ModelElement");
    const ModelArray_1 = require("../ModelArray");
    const SVGCollection_1 = require("../SVGCollection");
    class ChartDataPoint {
        constructor(y) {
            this.y = new ModelElement_1.default(y);
        }
    }
    exports.ChartDataPoint = ChartDataPoint;
    class LabeledChartDataPoint extends ChartDataPoint {
    }
    exports.LabeledChartDataPoint = LabeledChartDataPoint;
    class ChartAxis extends SVGComponent_1.default {
    }
    exports.ChartAxis = ChartAxis;
    class ChartModel {
        constructor(width, height, data) {
            this.width = new ModelElement_1.default(width);
            this.height = new ModelElement_1.default(height);
            this.data = new ModelArray_1.default(data || []);
        }
        reload(data) {
        }
    }
    exports.ChartModel = ChartModel;
    class ChartComponent extends SVGComponent_1.default {
        constructor(parent) {
            super("svg", parent);
        }
    }
    exports.ChartComponent = ChartComponent;
    const model = new ChartModel(300, 200);
    new ChartComponent(document.getElementById("app-root"))
        .withWidth(model.width)
        .withHeight(model.height)
        .withClass('chart')
        .child(new SVGComponent_1.default("rect")
        .withWidth(model.width)
        .withHeight(model.height)
        .withClass('perimeter')
        .reinit(), new SVGCollection_1.SVGCollection("g")
        .children(model.data, function (entry, i) {
        return new SVGComponent_1.default("rect")
            .withX(i * 7)
            .withHeight(entry.get().y)
            .withWidth(5)
            .withClass("bar")
            .reinit();
    })
        .reinit()).reinit();
    window["model"] = model;
    model.data.add(new ChartDataPoint(10));
    model.data.add(new ChartDataPoint(12));
    model.data.add(new ChartDataPoint(14));
    model.data.add(new ChartDataPoint(18));
    window["ChartDataPoint"] = ChartDataPoint;
});
