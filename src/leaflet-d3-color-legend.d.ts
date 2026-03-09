import * as d3 from "d3";
import * as L from "leaflet";


declare module 'leaflet' {
    namespace Control {

        type D3Scale = d3.ScaleLinear<number|string, string> |
               d3.ScaleQuantize<number|string> |
               d3.ScaleThreshold<number|string, string> |
               d3.ScaleLogarithmic<number|string, string> |
               d3.ScaleSequential<string>;

        interface ColorLegendOptions extends L.ControlOptions {
            colorScale?: D3Scale,
            label: string
        }

        export class ColorLegend extends L.Control {
            options: ColorLegendOptions;
            constructor(options?: ColorLegendOptions);
            onAdd(map: L.Map): HTMLElement;
            _univariate(scale: D3Scale, label: string): HTMLElement;
        }
    }

    namespace control {
        export function colorLegend(options: Control.ColorLegendOptions): Control.ColorLegend
    }
}
