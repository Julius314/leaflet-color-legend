import * as d3$1 from "d3";
import * as d3 from "d3";
import * as L$3 from "leaflet";
import * as L$2 from "leaflet";
import * as L$1 from "leaflet";
import * as L from "leaflet";

//#region dist/.tsdown-types-es/legend/base.d.ts
type ContinuousScale = d3$1.ScaleSequential<string> | d3$1.ScaleLinear<string, any> | d3$1.ScaleSymLog<string, any> | d3$1.ScalePower<string, any>;
type DiscreteScale = d3$1.ScaleQuantize<string> | d3$1.ScaleQuantile<string> | d3$1.ScaleThreshold<number, string>;
type SupportedScale = ContinuousScale | DiscreteScale;
interface LegendOptions extends L$3.ControlOptions {
	scale?: SupportedScale;
	interpolator?: (t: number) => string;
	label?: string;
	nTicks?: number;
	width?: number;
	height?: number;
}

//#endregion
//#region dist/.tsdown-types-es/legend/univariate.d.ts
/**

* Basic single‑value legend with optional indicator and label

*/
/**

* Basic single‑value legend with optional indicator and label

*/
declare class UnivariateLegend extends L$2.Control {
	protected scale: SupportedScale;
	protected data?: number[];
	protected indicatorG?: d3.Selection<SVGGElement, unknown, null, undefined>;
	protected label: string;
	protected labelG?: d3.Selection<SVGGElement, unknown, null, undefined>;
	protected currentSize?: any;
	constructor(dataOrScale: number[] | SupportedScale, options?: LegendOptions);
	onAdd(map: L$2.Map): HTMLElement;
	getHTML(): HTMLElement;
	/**
	
	* Place (or move) an indicator dot on the legend at the given value.
	
	* Call with `null` to remove the indicator.
	
	*/
	setValue(value: {
		val: number
		label: string
	} | null): void;
	private univariate;
	private renderContinuousScale;
	private renderDiscreteScale;
	get colorScale(): SupportedScale;
}
declare function colorLegend(dataOrScale: number[] | SupportedScale, options?: LegendOptions): UnivariateLegend;

//#endregion
//#region dist/.tsdown-types-es/legend/bivariate.d.ts
interface BivariateOptions extends LegendOptions {
	scaleX?: SupportedScale;
	scaleY?: SupportedScale;
	interpolator?: (u: number, v: number) => string;
	width?: number;
	height?: number;
}
declare class BivariateLegend extends L$1.Control {
	constructor(options?: BivariateOptions);
	onAdd(map: L$1.Map): HTMLElement;
}

//#endregion
//#region dist/.tsdown-types-es/legend/categorical.d.ts
interface CategoricalOptions extends LegendOptions {
	categories?: string[];
}
declare class CategoricalLegend extends L.Control {
	constructor(options?: CategoricalOptions);
	onAdd(map: L.Map): HTMLElement;
}

//#endregion
export { BivariateLegend, CategoricalLegend, UnivariateLegend as LeafletLegend, UnivariateLegend, colorLegend };