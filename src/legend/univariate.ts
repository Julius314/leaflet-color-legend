import * as d3 from "d3";
import * as L from "leaflet";
import {
  SupportedScale,
  LegendOptions,
  isDiscreteScale,
  createSequentialScale
} from "./base";

/**
 * Basic single‑value legend with optional indicator and label
 */
export class UnivariateLegend extends L.Control {
  protected scale!: SupportedScale;
  protected data?: number[];
  protected indicatorG?: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected label: string = "";
  protected labelG?: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected currentSize?: any;

  constructor(
    dataOrScale: number[] | SupportedScale,
    options?: LegendOptions
  ) {
    super(options);

    if (typeof dataOrScale === "function") {
      this.scale = dataOrScale;
    } else {
      this.data = dataOrScale;
      this.scale = createSequentialScale(
        dataOrScale,
        options?.interpolator ?? d3.interpolatePlasma
      );
    }
  }

  /* inherited from L.Control */
  override onAdd(map: L.Map): HTMLElement {
    return this.univariate(this.scale, this.options);
  }

  getHTML(): HTMLElement {
    return this.univariate(this.scale, this.options);
  }

  /**
   * Place (or move) an indicator dot on the legend at the given value.
   * Call with `null` to remove the indicator.
   */
  setValue(value: { val: number; label: string } | null): void {
    if (!this.indicatorG || !this.currentSize) return;

    this.indicatorG.selectAll("*").remove();
    const size = this.currentSize;

    if (value === null) {
      this.labelG?.select("text.label").text(this.label);
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
      ? d3.hsl(rgb).l > 0.5
        ? "#333"
        : "#eee"
      : "#333";

    const r = size.gradHeight * 0.25;

    // Stem line from top of gradient bar down to dot
    this.indicatorG
      .append("line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", -size.gradHeight) // top of gradient bar
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
    this.labelG
      ?.select("text.label")
      .text((value.label ? value.label : this.label) + ": " + value.val.toLocaleString());
  }

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
      gradHeight: height * 0.5,
      gradOffset: height * 0.3,
      ticksHeight: height * 0.2,
      padX: 10,
      padY: 2
    };

    this.currentSize = size;

    const svg = d3
      .select(div)
      .append("svg")
      .attr("width", size.width + 2 * size.padX)
      .attr("height",
        size.gradHeight + size.ticksHeight + size.gradOffset + 2 * size.padY
      );

    if (options.label) {
      this.label = options.label;
      this.labelG = svg.append("g");

      this.labelG?.append("text")
        .attr("class", "label")
        .attr("x", size.padX)
        .attr("dy", 1)
        .attr("y", size.padY + size.gradOffset * 0.5)
        .style("dominant-baseline", "central")
        .style("text-anchor", "start")
        .style("font-size", Math.min(10, size.gradOffset * 0.7))
        .style("font-weight", "bold")
        .text(this.label);
    }

    const gradG = svg.append("g").attr("transform",
      `translate(${size.padX},${size.padY + size.gradOffset})`
    );

    const ticksG = svg.append("g").attr("transform",
      `translate(${size.padX},${size.padY + size.gradHeight + size.gradOffset})`
    );

    // Indicator group sits at the same Y origin as gradG so y=-gradHeight means
    // the top of the bar, and y=0 means the bottom of the bar.
    this.indicatorG = svg.append("g").attr("transform",
      `translate(${size.padX},${size.padY + size.gradOffset + size.gradHeight})`
    );

    const isDiscrete = isDiscreteScale(scale);
    const [d0, d1] = scale.domain();

    if (isDiscrete) {
      this.renderDiscreteScale(scale, gradG, ticksG, size, d0, d1, nTicks);
    } else {
      this.renderContinuousScale(scale, svg, gradG, ticksG, size, d0, d1, nTicks);
    }

    return div;
  }

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

    const samples = d3.range(nTicks).map((i: number) => {
      const t = i / (nTicks - 1);
      const value = d0 + t * (d1 - d0);
      return { offset: t * 100, value, color: (scale as any)(value) };
    });

    const format = d3.tickFormat(d0, d1, nTicks - 1);
    ticksG.append("line")
      .attr("x1", 0)
      .attr("x2", size.width)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "black");

    for (const s of samples) {
      gradient.append("stop")
        .attr("offset", `${s.offset}%`)
        .style("stop-color", s.color);

      ticksG.append("line")
        .attr("x1", (s.offset / 100) * size.width)
        .attr("x2", (s.offset / 100) * size.width)
        .attr("y1", 0)
        .attr("y2", size.ticksHeight * 0.3)
        .attr("stroke", "black");

      ticksG.append("text")
        .attr("x", (s.offset / 100) * size.width)
        .attr("y", size.ticksHeight * 0.5)
        .style("dominant-baseline", "hanging")
        .style("text-anchor", "middle")
        .style("font-size", Math.max(7, size.ticksHeight * 0.9))
        .text(format(s.value));
    }
  }

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
    const format = d3.tickFormat(d0, d1, nTicks - 1);

    const blockWidth = size.width / numColors;

    const skipLabels = Math.max(1,Math.floor((numColors/(nTicks))))
    colors.forEach((color: string, i: number) => {
      let x = i * blockWidth
      const ext = scale.invertExtent(color)
      ticksG.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", size.ticksHeight * 0.3)
        .attr("stroke", "black");
      if(i%skipLabels == 0){

        const label = ext[0] 
        ticksG.append("text")
          .attr("x", x)
          .attr("y", size.ticksHeight * 0.5)
          .style("dominant-baseline", "hanging")
          .style("text-anchor", "middle")
          .style("font-size", Math.max(7, size.ticksHeight * 0.9))
          .text(format(label));
      }
      gradG.append("rect")
        .attr("x", x)
        .attr("width", blockWidth)
        .attr("height", size.gradHeight)
        .style("fill", color)
        .style("stroke", "#999")
        .style("stroke-opacity", 0.3)
        .style("stroke-width", "1px");
    });

    ticksG.append("line")
      .attr("x1", 0)
      .attr("x2", size.width)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "black");

    // tick at the end of the scale
    ticksG.append("line")
      .attr("x1", size.width)
      .attr("x2", size.width)
      .attr("y1", 0)
      .attr("y2", size.ticksHeight * 0.3)
      .attr("stroke", "black");

    ticksG.append("text")
      .attr("x", size.width)
      .attr("y", size.ticksHeight * 0.5)
      .style("dominant-baseline", "hanging")
      .style("text-anchor", "middle")
      .style("font-size", Math.max(7, size.ticksHeight * 0.9))
      .text((d1));
  }

  get colorScale(): SupportedScale {
    return this.scale;
  }
}

export function colorLegend(
  dataOrScale: number[] | SupportedScale,
  options?: LegendOptions
): UnivariateLegend {
  return new UnivariateLegend(dataOrScale, options);
}
