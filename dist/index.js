import * as d3 from "d3";
import * as L from "leaflet";

//#region src/leaflet-d3-color-legend.ts
var LeafletLegend = class extends L.Control {
	scale;
	data;
	indicatorG;
	label = "";
	labelG;
	currentSize;
	constructor(dataOrScale, options) {
		super(options);
		if (typeof dataOrScale === "function") this.scale = dataOrScale;
		else {
			this.data = dataOrScale;
			this.scale = this.createSequentialScale(dataOrScale, options?.interpolator ?? d3.interpolatePlasma);
		}
	}
	/**
	
	* inherited from L.Control
	
	*/
	onAdd(map) {
		return this.univariate(this.scale, this.options);
	}
	/**
	
	* Returns the HTML containing the SVG.
	
	*/
	getHTML() {
		return this.univariate(this.scale, this.options);
	}
	/**
	
	* Place (or move) an indicator dot on the legend at the given value.
	
	* Call with `null` to remove the indicator.
	
	*/
	setValue(value) {
		if (!this.indicatorG || !this.currentSize) return;
		this.indicatorG.selectAll("*").remove();
		const size = this.currentSize;
		if (value === null) {
			this.labelG?.select("text.label").text(this.label);
			return;
		}
		const [d0, d1] = this.scale.domain();
		const clamped = Math.max(d0, Math.min(d1, value.val));
		const t = (clamped - d0) / (d1 - d0);
		const x = t * size.width;
		const color = this.scale(clamped);
		const rgb = d3.color(color);
		const outline = rgb ? d3.hsl(rgb).l > .5 ? "#333" : "#eee" : "#333";
		const r = size.gradHeight * .25;
		this.indicatorG.append("line").attr("x1", x).attr("x2", x).attr("y1", -size.gradHeight).attr("y2", -size.gradHeight * .25).attr("stroke", outline).attr("stroke-width", 1.5).attr("stroke-dasharray", "2,2");
		this.indicatorG.append("circle").attr("cx", x).attr("cy", -size.gradHeight * .5).attr("r", r).attr("fill", color).attr("stroke", outline).attr("stroke-width", 1.5);
		this.labelG?.select("text.label").text((value.label ? value.label : this.label) + ": " + value.val.toLocaleString());
	}
	createSequentialScale(data, interpolator) {
		const extent = d3.extent(data);
		return d3.scaleSequential(interpolator).domain(extent);
	}
	/**
	
	* checks if the passed scale is a discrete or continuous scale
	
	*/
	isDiscreteScale(scale) {
		const s = scale;
		if (typeof s.interpolator === "function") return false;
		if (typeof s.quantiles === "function") return true;
		if (typeof s.invertExtent === "function") return true;
		return false;
	}
	/**
	
	* creates the svg for a univariate colorscale.
	
	*/
	univariate(scale, options) {
		const div = L.DomUtil.create("div", "leaflet-control-layers");
		const nTicks = options.nTicks || 4;
		const width = options.width || 100;
		const height = options.height || 40;
		const size = {
			width,
			gradHeight: height * .5,
			gradOffset: height * .3,
			ticksHeight: height * .2,
			padX: 10,
			padY: 2
		};
		this.currentSize = size;
		const svg = d3.select(div).append("svg").attr("width", size.width + 2 * size.padX).attr("height", size.gradHeight + size.ticksHeight + size.gradOffset + 2 * size.padY);
		if (options.label) {
			this.label = options.label;
			this.labelG = svg.append("g");
			this.labelG?.append("text").attr("class", "label").attr("x", size.padX).attr("dy", 1).attr("y", size.padY + size.gradOffset * .5).style("dominant-baseline", "central").style("text-anchor", "start").style("font-size", Math.min(10, size.gradOffset * .7)).style("font-weight", "bold").text(this.label);
		}
		const gradG = svg.append("g").attr("transform", `translate(${size.padX},${size.padY + size.gradOffset})`);
		const ticksG = svg.append("g").attr("transform", `translate(${size.padX},${size.padY + size.gradHeight + size.gradOffset})`);
		this.indicatorG = svg.append("g").attr("transform", `translate(${size.padX},${size.padY + size.gradOffset + size.gradHeight})`);
		const isDiscrete = this.isDiscreteScale(scale);
		const [d0, d1] = scale.domain();
		if (isDiscrete) this.renderDiscreteScale(scale, gradG, ticksG, size, d0, d1, nTicks);
		else this.renderContinuousScale(scale, svg, gradG, ticksG, size, d0, d1, nTicks);
		return div;
	}
	/**
	
	* renders the continuous colorscale.
	
	*/
	renderContinuousScale(scale, svg, gradG, ticksG, size, d0, d1, nTicks) {
		let gradientId = "color-grad-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 12).padStart(12, "0");
		const gradient = svg.append("defs").append("linearGradient").attr("id", gradientId).attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
		gradG.append("rect").attr("width", size.width).attr("height", size.gradHeight).style("fill", `url(#${gradientId})`);
		const samples = d3.range(nTicks).map((i) => {
			const t = i / (nTicks - 1);
			const value = d0 + t * (d1 - d0);
			return {
				offset: t * 100,
				value,
				color: scale(value)
			};
		});
		const format = d3.tickFormat(d0, d1, nTicks - 1);
		ticksG.append("line").attr("x1", 0).attr("x2", size.width).attr("y1", 0).attr("y2", 0).attr("stroke", "black");
		for (const s of samples) {
			gradient.append("stop").attr("offset", `${s.offset}%`).style("stop-color", s.color);
			ticksG.append("line").attr("x1", s.offset / 100 * size.width).attr("x2", s.offset / 100 * size.width).attr("y1", 0).attr("y2", size.ticksHeight * .3).attr("stroke", "black");
			ticksG.append("text").attr("x", s.offset / 100 * size.width).attr("y", size.ticksHeight * .5).style("dominant-baseline", "hanging").style("text-anchor", "middle").style("font-size", Math.max(7, size.ticksHeight * .9)).text(format(s.value));
		}
	}
	/**
	
	* renders the discrete colorscale.
	
	*/
	renderDiscreteScale(scale, gradG, ticksG, size, d0, d1, nTicks) {
		const colors = scale.range();
		const numColors = colors.length;
		let thresholds = [];
		if (typeof scale.quantiles === "function") thresholds = scale.quantiles();
		else if (typeof scale.invertExtent === "function") thresholds = scale.domain();
		else for (let i = 0; i < numColors - 1; i++) thresholds.push(d0 + (i + 1) / numColors * (d1 - d0));
		const blockWidth = size.width / numColors;
		colors.forEach((color, i) => {
			gradG.append("rect").attr("x", i * blockWidth).attr("width", blockWidth).attr("height", size.gradHeight).style("fill", color).style("stroke", "#999").style("stroke-opacity", .3).style("stroke-width", "1px");
		});
		ticksG.append("line").attr("x1", 0).attr("x2", size.width).attr("y1", 0).attr("y2", 0).attr("stroke", "black");
		const format = d3.format(".2g");
		const labels = [
			d0,
			...thresholds.slice(0, Math.min(thresholds.length, nTicks - 2)),
			d1
		];
		const labelPositions = labels.map((v) => (v - d0) / (d1 - d0) * size.width);
		labels.forEach((label, i) => {
			const x = labelPositions[i];
			if (x >= 0 && x <= size.width) {
				ticksG.append("line").attr("x1", x).attr("x2", x).attr("y1", 0).attr("y2", size.ticksHeight * .3).attr("stroke", "black");
				ticksG.append("text").attr("x", x).attr("y", size.ticksHeight * .5).style("dominant-baseline", "hanging").style("text-anchor", "middle").style("font-size", Math.max(7, size.ticksHeight * .9)).text(format(label));
			}
		});
	}
	/**
	
	* returns the colorscale.
	
	*/
	get colorScale() {
		return this.scale;
	}
};
/**

* export of factory function

*/
function colorLegend(dataOrScale, options) {
	return new LeafletLegend(dataOrScale, options);
}

//#endregion
export { LeafletLegend, colorLegend };