import { select } from "d3-select";
import { ScaleSequential, range } from "d3-scale";
import * as L from "leaflet";


export class LeafletLegend extends L.Control {
    options = {};
    constructor(options){
      super(options);
    }
  
    onAdd (map) {
        //TODO allow categorical colors        
        return this.univariate(this.options.scale, this.options.label);
    }

    univariate(scale, label) {
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
    
        let svg = select(div).append('svg')
            .attr("width", size.width+(2*size.padX))
            .attr("height", size.height+size.textHeight+size.padY);
  
        let gradG = svg.append('g')
            .attr("transform", "translate("+size.padX+","+size.padY+")")
  
        let textG = svg.append('g')
            .attr("transform", "translate("+size.padX+", "+(size.padY+size.height)+")");
    
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "colorLegend")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
    
      let scaleDomain = scale.domain();
      let samples = range(nSamples).map(i => {
        const value = scaleDomain[0] + (i / (nSamples - 1)) * (scaleDomain[1] - scaleDomain[0]); // Scale the value between the domain range
        const color = scale(value);
        
        return {
          index: (i / (nSamples - 1))*100,
          domainValue: scale.valueFormat(value),
          colorValue: color,
        };
      });
      
      for (let index = 0; index < samples.length; index++) {
          const s = samples[index];
  
          //add color stops to gradient
          gradient.append("stop")
          .attr("offset", s.index+"%")
          .style("stop-color", s.colorValue);
  
          textG.append("line")
              .attr('x1', (s.index/100)*size.width)
              .attr('x2', (s.index/100)*size.width)
              .attr('y1', 0)
              .attr('y2', size.height*.1)
              .attr('stroke', 'black');
  
          textG.append("text")
              .attr("class", "color-legend-value-text")
              .attr("x",(s.index/100)*size.width)
              .attr("y", size.textHeight*.25)
              .style("dominant-baseline", "central")
              .style("text-anchor", "middle")
              .style("font-size", size.textHeight*.45)
              .text(s.domainValue);
      }
      // Create rectangle for the legend
      gradG.append("rect")
        .attr("width", size.width)
        .attr("height", size.height)
        .style("fill", "url(#colorLegend)");
    
      textG.append("text")
          .attr("x", size.width*.5)
          .attr("y", size.textHeight*.75)
          .style("dominant-baseline", "central")
          .style("text-anchor", "middle")
          .style("font-size", size.textHeight*.45)
          .style("font-weight", "bold")
          .text(label)
  
        return div;
    }
}