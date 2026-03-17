import { ScaleLinear, ScalePower, ScaleQuantile, ScaleQuantize, ScaleSequential, ScaleSequentialPower, ScaleSequentialSymLog, ScaleSymLog, ScaleThreshold, Selection } from "d3";
import { Control, ControlOptions, Map } from "leaflet";

//#region dist/.tsdown-types-es/legend/base.d.ts
type ContinuousScale = ScaleSequential<string> | ScaleSequentialSymLog<string> | ScaleSequentialPower<string> | ScaleLinear<string, any> | ScaleSymLog<string, any> | ScalePower<string, any>;
type DiscreteScale = ScaleQuantize<string> | ScaleQuantile<string> | ScaleThreshold<number, string>;
type SupportedScale = ContinuousScale | DiscreteScale;
interface LegendOptions extends ControlOptions {
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
declare class UnivariateLegend extends Control {
	protected scale: SupportedScale;
	protected data?: number[];
	protected indicatorG?: Selection<SVGGElement, unknown, null, undefined>;
	protected label: string;
	protected labelG?: Selection<SVGGElement, unknown, null, undefined>;
	protected currentSize?: any;
	constructor(dataOrScale: number[] | SupportedScale, options?: LegendOptions);
	onAdd(map: Map): HTMLElement;
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
declare class BivariateLegend extends Control {
	constructor(options?: BivariateOptions);
	onAdd(map: Map): HTMLElement;
}

//#endregion
//#region dist/.tsdown-types-es/legend/categorical.d.ts
interface CategoricalOptions extends LegendOptions {
	categories?: string[];
}
declare class CategoricalLegend extends Control {
	constructor(options?: CategoricalOptions);
	onAdd(map: Map): HTMLElement;
}

//#endregion
export { BivariateLegend, CategoricalLegend, UnivariateLegend as LeafletLegend, UnivariateLegend, colorLegend };