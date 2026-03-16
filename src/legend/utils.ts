import * as d3 from "d3";

export function computeHistogram(data: number[], bins: number | number[]): d3.Bin<number, number>[] {
  return d3.bin().thresholds(bins)(data as any);
}

export function computeKDE(data: number[], bandwidth?: number): Array<[number, number]> {
  // simple gaussian KDE; user can override bandwidth
  const kde = (kernel: (v: number) => number, x: number[]) => {
    return x.map(xi => [xi, d3.mean(data, d => kernel(xi - d)) ?? 0] as [number, number]);
  };
  const kernelEpanechnikov = (k: number) => {
    return (v: number) => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
  const extent = d3.extent(data) as [number, number];
  const x = d3.range(extent[0], extent[1], (extent[1] - extent[0]) / 100);
  return kde(kernelEpanechnikov(bandwidth || (extent[1] - extent[0]) / 10), x);
}

// placeholder for beeswarm layout
export function computeBeeswarm(data: number[], width: number): Array<{x:number,y:number}> {
  // simple 1D layout; real implementation uses d3-beeswarm or custom force
  const spacing = 5;
  return data.map((d, i) => ({ x: d, y: (i % 10) * spacing }));
}
