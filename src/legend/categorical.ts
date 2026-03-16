import * as L from "leaflet";
import { SupportedScale, LegendOptions } from "./base";

export interface CategoricalOptions extends LegendOptions {
  categories?: string[];
}

export class CategoricalLegend extends L.Control {
  constructor(options?: CategoricalOptions) {
    super(options);
  }

  override onAdd(map: L.Map): HTMLElement {
    const div = L.DomUtil.create("div", "leaflet-control-layers") as HTMLElement;
    // TODO render discrete color blocks with labels
    return div;
  }
}
