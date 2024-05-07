(function (factory) {
    // define an AMD module that relies on 'leaflet' and d3
    if (typeof define === "function" && define.amd) {
        define(["leaflet", "d3"], factory);

    // define a CommonJS module that relies on 'leaflet' and d3
    } else if (typeof module === "object" && typeof module.exports === "object") {
        const L = require("leaflet");
        const d3 = require("d3");
        module.exports = factory(L, d3);
    }

    // attach your plugin to the global 'L' and 'd3' variable
    if (typeof window !== "undefined" && window.L && typeof window.d3 !== "undefined") {
        factory(window.L, window.d3);
    }
})(function(L, d3) {

L.Control.ColorLegend = L.Control.extend({

    initialize: function (options) {
        L.Util.setOptions(this, options);
    },

    _univariate: function (scale, label) {
        var div = L.DomUtil.create('div', 'leaflet-control-layers');
        let nSamples = 4;
        // Define legend dimensions
        const size = {
            width: 100,
            height: 20,
            textHeight: 20,
            padX: 8,
            padY: 3
        }

        let svg = d3.select(div).append('svg')
            .attr("width", size.width + (2 * size.padX))
            .attr("height", size.height + size.textHeight + size.padY);

        let gradG = svg.append('g')
            .attr("transform", "translate(" + size.padX + "," + size.padY + ")")

        let textG = svg.append('g')
            .attr("transform", "translate(" + size.padX + ", " + (size.padY + size.height) + ")");

        let defsid = "colorLegend"+String(Math.random());

        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", defsid)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        let scaleDomain = scale.domain();
        let samples = d3.range(nSamples).map(i => {
            const value = scaleDomain[0] + (i / (nSamples - 1)) * (scaleDomain[1] - scaleDomain[0]); // Scale the value between the domain range
            const color = scale(value);

            return {
                index: (i / (nSamples - 1)) * 100,
                domainValue: d3.format(".2s")(value),
                colorValue: color,
            };
        });

        for (let index = 0; index < samples.length; index++) {
            const s = samples[index];

            //add color stops to gradient
            gradient.append("stop")
                .attr("offset", s.index + "%")
                .style("stop-color", s.colorValue);

            textG.append("line")
                .attr('x1', (s.index / 100) * size.width)
                .attr('x2', (s.index / 100) * size.width)
                .attr('y1', 0)
                .attr('y2', size.height * .1)
                .attr('stroke', 'black');

            textG.append("text")
                .attr("class", "color-legend-value-text")
                .attr("x", (s.index / 100) * size.width)
                .attr("y", size.textHeight * .25)
                .style("dominant-baseline", "central")
                .style("text-anchor", "middle")
                .style("font-size", size.textHeight * .45)
                .text(s.domainValue);
        }
        // Create rectangle for the legend
        gradG.append("rect")
            .attr("width", size.width)
            .attr("height", size.height)
            .style("fill", "url(#"+defsid+")");

        textG.append("text")
            .attr("x", size.width * .5)
            .attr("y", size.textHeight * .75)
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle")
            .style("font-size", size.textHeight * .45)
            .style("font-weight", "bold")
            .text(label)

        return div;
    },


    onAdd: function () {
        return this._univariate(this.options.colorScale, this.options.label)
    }
})

});