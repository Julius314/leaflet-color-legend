import { Control, DomUtil, Map } from "leaflet";
import { SupportedScale, LegendOptions } from "./base";

export interface CategoricalOptions extends LegendOptions {
  categories?: string[];
}

export class CategoricalLegend extends Control {
  constructor(options?: CategoricalOptions) {
    super(options);
  }

  override onAdd(map: Map): HTMLElement {
    const div = DomUtil.create("div", "leaflet-control-layers") as HTMLElement;
    // TODO render discrete color blocks with labels
    return div;
  }
}
