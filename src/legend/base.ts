import {extent, scaleSequential, ScaleSequential, ScaleLinear, ScaleSymLog, ScalePower, ScaleQuantize, ScaleQuantile, ScaleThreshold } from "d3";
import { ControlOptions } from "leaflet";

export type ContinuousScale =
  | ScaleSequential<string>
  | ScaleLinear<string, any>
  | ScaleSymLog<string, any>
  | ScalePower<string, any>;

export type DiscreteScale =
  | ScaleQuantize<string>
  | ScaleQuantile<string>
  | ScaleThreshold<number, string>;

export type SupportedScale = ContinuousScale | DiscreteScale;

export interface LegendOptions extends ControlOptions {
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
  const ext = extent(data) as [number, number];
  return new scaleSequential(interpolator).domain(ext);
}
