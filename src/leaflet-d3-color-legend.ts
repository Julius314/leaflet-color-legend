import * as d3 from "d3";
import * as L from "leaflet";

/**
 * Supported scales (Continuous - rendered as gradient):
 * - ScaleSequential: continuous to continuous interpolation
 * - ScaleLinear: continuous domain to string range mapping
 * - ScaleLog: logarithmic scale
 * - ScaleSymlog: symmetric logarithmic scale
 * - ScalePow: power scale (sqrt, cbrt, etc)
 * 
 * Supported scales (Discrete - rendered as color blocks):
 * - ScaleQuantize: continuous domain to discrete color range
 * - ScaleQuantile: data-driven quantile discretization
 * - ScaleThreshold: discrete thresholds mapping
 * 
 * Not supported:
 * - Ordinal/Band/Point scales (discrete domain, no natural gradient)
 */
type ContinuousScale = 
  | d3.ScaleSequential<string>
  | d3.ScaleLinear<string, any>
 // | d3.ScaleLog<string, any>
  | d3.ScaleSymLog<string, any>
  | d3.ScalePower<string, any>;

type DiscreteScale =
  | d3.ScaleQuantize<string>
  | d3.ScaleQuantile<string>
  | d3.ScaleThreshold<number, string>;

type SupportedScale = ContinuousScale | DiscreteScale;

interface LegendOptions extends L.ControlOptions {
  scale?: SupportedScale;
  interpolator?: (t: number) => string;
  label?: string,
  nTicks?: number,
  width?: number,
  height?: number
}

export class LeafletLegend extends L.Control {

  private scale!: SupportedScale;
  private data?: number[];
  private indicatorG?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private label: string = ""
  private labelG?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private currentSize?: any;

  constructor(
    dataOrScale: number[] | SupportedScale,
    options?: LegendOptions
  ) {
    super(options);

    if (typeof dataOrScale === "function") {
      this.scale = dataOrScale;
    } else {
      this.data = dataOrScale;
      this.scale = this.createSequentialScale(
        dataOrScale,
        options?.interpolator ?? d3.interpolatePlasma
      );
    }
  }

  /**
   * inherited from L.Control
   */
  override onAdd(map: L.Map): HTMLElement {
    return this.univariate(this.scale, this.options);
  }

  /**
   * Returns the HTML containing the SVG.
   */
  getHTML(): HTMLElement {
    return this.univariate(this.scale, this.options);
  } 

  /**
   * Place (or move) an indicator dot on the legend at the given value.
   * Call with `null` to remove the indicator.
   */
  setValue(value:{val: number, label: string}|null): void {
    if (!this.indicatorG || !this.currentSize) return;

    this.indicatorG.selectAll("*").remove();
    const size = this.currentSize;

    if (value === null) {
      this.labelG?.select("text.label").text(this.label)
      return;
    } 

    const [d0, d1] = this.scale.domain();

    // Clamp value to domain
    const clamped = Math.max(d0, Math.min(d1, value.val));
    const t = (clamped - d0) / (d1 - d0);
    const x = t * size.width;

    const color = (this.scale as any)(clamped) as string;

    // Determine contrasting outline color
    const rgb = d3.color(color);
    const outline = rgb
      ? d3.hsl(rgb).l > 0.5 ? "#333" : "#eee"
      : "#333";

    const r = size.gradHeight * 0.25;

    // Stem line from top of gradient bar down to dot
    this.indicatorG
      .append("line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", -size.gradHeight)       // top of gradient bar
      .attr("y2", -size.gradHeight * 0.25) // just above dot
      .attr("stroke", outline)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "2,2");

    // The dot itself, centered on the gradient bar
    this.indicatorG
      .append("circle")
      .attr("cx", x)
      .attr("cy", -size.gradHeight * 0.5)
      .attr("r", r)
      .attr("fill", color)
      .attr("stroke", outline)
      .attr("stroke-width", 1.5);


      //set Text 
    this.labelG?.select("text.label").text((value.label ? value.label : this.label) + ": " + value.val.toLocaleString());
  }


  private createSequentialScale(
    data: number[],
    interpolator: (t: number) => string
  ): SupportedScale {
    const extent = d3.extent(data) as [number, number];
    return d3.scaleSequential(interpolator).domain(extent);
  }

  /**
   * checks if the passed scale is a discrete or continuous scale
   */
  private isDiscreteScale(scale: SupportedScale): boolean {
    const s = scale as any;

    // Sequential scales always have an interpolator
    if (typeof s.interpolator === "function") return false;

    // Quantile-like scales are discrete
    if (typeof s.quantiles === "function") return true;
    if (typeof s.invertExtent === "function") return true;

    // Power, Linear, Symlog with a .range are still continuous
    // So any scale that is not a quantile-like or threshold is continuous
    return false;
  }

  /**
   * creates the svg for a univariate colorscale.
   */
  private univariate(
    scale: SupportedScale,
    options: LegendOptions
  ): HTMLElement {

    const div = L.DomUtil.create("div", "leaflet-control-layers") as HTMLElement;

    const nTicks = options.nTicks || 4;
    const width = options.width || 100;
    const height = options.height || 40;

    const size = {
      width: width,
      gradHeight: height*.5,
      gradOffset: height * .3,
      ticksHeight: height * .2,
      padX: 10,
      padY: 2
    };

    this.currentSize = size;

    const svg = d3.select(div)
      .append("svg")
      .attr("width", size.width + 2 * size.padX)
      .attr("height", size.gradHeight + size.ticksHeight + size.gradOffset + 2 * size.padY);

    if (options.label) {
      this.label = options.label
      this.labelG = svg.append("g")

      this.labelG?.append("text")
        .attr("class", "label")  
        .attr("x", size.padX )
        .attr("dy", 1)
        .attr("y", size.padY + size.gradOffset * 0.5)
        .style("dominant-baseline", "central")
        .style("text-anchor", "start")
        .style("font-size", Math.min(10,size.gradOffset * 0.7))
        .style("font-weight", "bold")
        .text(this.label);
    }

    const gradG = svg.append("g")
      .attr("transform", `translate(${size.padX},${size.padY + size.gradOffset})`);

    const ticksG = svg.append("g")
      .attr("transform", `translate(${size.padX},${size.padY + size.gradHeight + size.gradOffset})`);

    // Indicator group sits at the same Y origin as gradG so y=-gradHeight means
    // the top of the bar, and y=0 means the bottom of the bar.
    this.indicatorG = svg.append("g")
      .attr("transform", `translate(${size.padX},${size.padY + size.gradOffset + size.gradHeight})`);

    const isDiscrete = this.isDiscreteScale(scale);
    const [d0, d1] = scale.domain();

    if (isDiscrete) {
      this.renderDiscreteScale(scale, gradG, ticksG, size, d0, d1, nTicks);
    } else {
      this.renderContinuousScale(scale, svg, gradG, ticksG, size, d0, d1, nTicks);
    }

    return div;
  }

  /**
   * renders the continuous colorscale.
   */
  private renderContinuousScale(
    scale: SupportedScale,
    svg: d3.Selection<any, any, any, any>,
    gradG: d3.Selection<any, any, any, any>,
    ticksG: d3.Selection<any, any, any, any>,
    size: any,
    d0: number,
    d1: number,
    nTicks: number
  ): void {
    let gradientId = "color-grad-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 12).padStart(12, "0");
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradG.append("rect")
      .attr("width", size.width)
      .attr("height", size.gradHeight)
      .style("fill", `url(#${gradientId})`);

    const samples = d3.range(nTicks).map((i:number) => {
      const t = i / (nTicks - 1);
      const value = d0 + t * (d1 - d0);
      return { offset: t * 100, value, color: (scale as any)(value) };
    });

    const format = d3.tickFormat(d0, d1, nTicks - 1);
    ticksG.append("line")
      .attr("x1", 0).attr("x2", size.width)
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", "black");

    for (const s of samples) {
      gradient.append("stop")
        .attr("offset", `${s.offset}%`)
        .style("stop-color", s.color);

      ticksG.append("line")
        .attr("x1", (s.offset / 100) * size.width)
        .attr("x2", (s.offset / 100) * size.width)
        .attr("y1", 0).attr("y2", size.ticksHeight * 0.3)
        .attr("stroke", "black");

      ticksG.append("text")
        .attr("x", (s.offset / 100) * size.width)
        .attr("y", size.ticksHeight * 0.5)
        .style("dominant-baseline", "hanging")
        .style("text-anchor", "middle")
        .style("font-size", Math.max(7,size.ticksHeight * 0.9))
        .text(format(s.value));
    }
  }

  /**
   * renders the discrete colorscale.
   */
  private renderDiscreteScale(
    scale: SupportedScale,
    gradG: d3.Selection<any, any, any, any>,
    ticksG: d3.Selection<any, any, any, any>,
    size: any,
    d0: number,
    d1: number,
    nTicks: number
  ): void {
    const colors = (scale as any).range();
    const numColors = colors.length;

    let thresholds: number[] = [];
    if (typeof (scale as any).quantiles === 'function') {
      thresholds = (scale as any).quantiles() as number[];
    } else if (typeof (scale as any).invertExtent === 'function') {
      thresholds = (scale as any).domain() as number[];
    } else {
      for (let i = 0; i < numColors - 1; i++) {
        thresholds.push(d0 + ((i + 1) / numColors) * (d1 - d0));
      }
    }

    const blockWidth = size.width / numColors;

    colors.forEach((color: string, i: number) => {
      gradG.append("rect")
        .attr("x", i * blockWidth)
        .attr("width", blockWidth)
        .attr("height", size.gradHeight)
        .style("fill", color)
        .style("stroke", "#999")
        .style("stroke-opacity", 0.3)
        .style("stroke-width", "1px");
    });

    ticksG.append("line")
      .attr("x1", 0).attr("x2", size.width)
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", "black");

    const format = d3.format(".2g");
    const labels = [d0, ...thresholds.slice(0, Math.min(thresholds.length, nTicks - 2)), d1];
    const labelPositions = labels.map(v => ((v - d0) / (d1 - d0)) * size.width);

    labels.forEach((label, i) => {
      const x = labelPositions[i];
      if (x >= 0 && x <= size.width) {
        ticksG.append("line")
          .attr("x1", x).attr("x2", x)
          .attr("y1", 0).attr("y2", size.ticksHeight * 0.3)
          .attr("stroke", "black");

        ticksG.append("text")
          .attr("x", x).attr("y", size.ticksHeight * 0.5)
          .style("dominant-baseline", "hanging")
          .style("text-anchor", "middle")
          .style("font-size", Math.max(7,size.ticksHeight * 0.9))
          .text(format(label));
      }
    });
  }

  /**
   * returns the colorscale.
   */
  get colorScale(): SupportedScale {
    return this.scale;
  }
}

/**
 * export of factory function
 */
export function colorLegend(
  dataOrScale: number[] | SupportedScale,
  options?: LegendOptions
): LeafletLegend {
  return new LeafletLegend(dataOrScale, options)
}