import * as d3 from "d3";
import * as L from "leaflet";

//#region dist/.tsdown-types-es/leaflet-d3-color-legend.d.ts
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
type ContinuousScale = d3.ScaleSequential<string> | d3.ScaleLinear<string, any> | d3.ScaleSymLog<string, any> | d3.ScalePower<string, any>;
/**
	
	* inherited from L.Control
	
	*/
type DiscreteScale = d3.ScaleQuantize<string> | d3.ScaleQuantile<string> | d3.ScaleThreshold<number, string>;
/**
	
	* inherited from L.Control
	
	*/
type SupportedScale = ContinuousScale | DiscreteScale;
/**
	
	* inherited from L.Control
	
	*/
interface LegendOptions extends L.ControlOptions {
	scale?: SupportedScale;
	interpolator?: (t: number) => string;
	label?: string;
	nTicks?: number;
	width?: number;
	height?: number;
}
/**
	
	* inherited from L.Control
	
	*/
declare class LeafletLegend extends L.Control {
	private scale;
	private data?;
	private indicatorG?;
	private label;
	private labelG?;
	private currentSize?;
	constructor(dataOrScale: number[] | SupportedScale, options?: LegendOptions);
	/**
	
	* inherited from L.Control
	
	*/
	onAdd(map: L.Map): HTMLElement;
	/**
	
	* Returns the HTML containing the SVG.
	
	*/
	getHTML(): HTMLElement;
	/**
	
	* Place (or move) an indicator dot on the legend at the given value.
	
	* Call with `null` to remove the indicator.
	
	*/
	setValue(value: {
		val: number
		label: string
	} | null): void;
	private createSequentialScale;
	/**
	
	* checks if the passed scale is a discrete or continuous scale
	
	*/
	private isDiscreteScale;
	/**
	
	* creates the svg for a univariate colorscale.
	
	*/
	private univariate;
	/**
	
	* renders the continuous colorscale.
	
	*/
	private renderContinuousScale;
	/**
	
	* renders the discrete colorscale.
	
	*/
	private renderDiscreteScale;
	/**
	
	* returns the colorscale.
	
	*/
	get colorScale(): SupportedScale;
}
/**

* export of factory function

*/
/**

* export of factory function

*/
declare function colorLegend(dataOrScale: number[] | SupportedScale, options?: LegendOptions): LeafletLegend;

//#endregion
export { LeafletLegend, colorLegend };