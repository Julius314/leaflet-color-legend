import * as d3 from "d3";
import * as L from "leaflet";

export type ContinuousScale =
  | d3.ScaleSequential<string>
  | d3.ScaleLinear<string, any>
  | d3.ScaleSymLog<string, any>
  | d3.ScalePower<string, any>;

export type DiscreteScale =
  | d3.ScaleQuantize<string>
  | d3.ScaleQuantile<string>
  | d3.ScaleThreshold<number, string>;

export type SupportedScale = ContinuousScale | DiscreteScale;

export interface LegendOptions extends L.ControlOptions {
  scale?: SupportedScale;
  interpolator?: (t: number) => string;
  label?: string;
  nTicks?: number;
  width?: number;
  height?: number;
}

// shared utility for scale type detection
export function isDiscreteScale(scale: SupportedScale): boolean {
  const s = scale as any;
  if (typeof s.interpolator === "function") return false;
  if (typeof s.quantiles === "function") return true;
  if (typeof s.invertExtent === "function") return true;
  return false;
}

export function createSequentialScale(
  data: number[],
  interpolator: (t: number) => string
): SupportedScale {
  const extent = d3.extent(data) as [number, number];
  return d3.scaleSequential(interpolator).domain(extent);
}
