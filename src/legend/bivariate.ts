import { Control, DomUtil, Map } from "leaflet";
import { LegendOptions, SupportedScale } from "./base";

export interface BivariateOptions extends LegendOptions {
  scaleX?: SupportedScale;
  scaleY?: SupportedScale;
  interpolator?: (u: number, v: number) => string;
  width?: number;
  height?: number;
}

export class BivariateLegend extends Control {
  // placeholder for future implementation
  constructor(options?: BivariateOptions) {
    super(options);
  }

  override onAdd(map: Map): HTMLElement {
    const div = DomUtil.create("div", "leaflet-control-layers") as HTMLElement;
    // TODO render 2D color square
    return div;
  }
}
