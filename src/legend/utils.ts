import {bin, Bin, mean, extent, range} from "d3";
import { SupportedScale } from "./base";

export function makeScaleHelpers(scale: SupportedScale): {
  normalize: (v: number) => number;
  invert:    (t: number) => number;
} {
  const domain = scale.domain();
  const d0 = domain[0];
  const d1 = domain[domain.length - 1];
  const s = (scale as any).copy();

  if (typeof s.interpolator === "function") {
    if (typeof s.invert === "function") {
      s.interpolator((t: number) => t);
      const normalize = (v: number) => s(Math.max(d0, Math.min(d1, v))) as number;
      const invert    = (t: number) => s.invert(t) as number;
      return { normalize, invert };
    } else {
      const normalize = (v: number) => (Math.max(d0, Math.min(d1, v)) - d0) / (d1 - d0);
      const invert    = (t: number) => d0 + t * (d1 - d0);
      return { normalize, invert };
    }
  }

  if (typeof s.range === "function") {
    s.range([0, 1]);
    const normalize = (v: number) => s(Math.max(d0, Math.min(d1, v))) as number;
    const invert    = (t: number) => s.invert(t) as number;
    return { normalize, invert };
  }

  const normalize = (v: number) => (v - d0) / (d1 - d0);
  const invert    = (t: number) => d0 + t * (d1 - d0);
  return { normalize, invert };
}

export function makeNormalizer(scale: SupportedScale): (value: number) => number {
  return makeScaleHelpers(scale).normalize;
}

export function computeHistogram(data: number[], bins: number | number[]): Bin<number, number>[] {
  return bin().thresholds(bins)(data as any);
}

export function computeKDE(data: number[], bandwidth?: number): Array<[number, number]> {
  // simple gaussian KDE; user can override bandwidth
  const kde = (kernel: (v: number) => number, x: number[]) => {
    return x.map(xi => [xi, mean(data, d => kernel(xi - d)) ?? 0] as [number, number]);
  };
  const kernelEpanechnikov = (k: number) => {
    return (v: number) => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
  const ext = extent(data) as [number, number];
  const x = range(ext[0], ext[1], (ext[1] - ext[0]) / 100);
  return kde(kernelEpanechnikov(bandwidth || (ext[1] - ext[0]) / 10), x);
}

// placeholder for beeswarm layout
export function computeBeeswarm(data: number[], width: number): Array<{x:number,y:number}> {
  // simple 1D layout; real implementation uses d3-beeswarm or custom force
  const spacing = 5;
  return data.map((d, i) => ({ x: d, y: (i % 10) * spacing }));
}
