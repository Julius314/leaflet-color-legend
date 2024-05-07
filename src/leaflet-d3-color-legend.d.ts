import * as d3 from "d3";
import * as L from "leaflet";

interface ColorLegendOptions extends L.ControlOptions {
    colorScale?: d3.ScaleSequential<any, any>,
    label: string
}

export declare class LeafletLegend extends L.Control {
    private options?;
    constructor(options?: ColorLegendOptions);
    onAdd(map: L.Map): HTMLElement;
    univariate(scale: d3.ScaleSequential<any, any>, label: string): HTMLElement;
}
