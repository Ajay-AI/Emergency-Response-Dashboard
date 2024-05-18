import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';
import './css/radialstackedbar.css';
var radialdata;
var width = 1400, height = 900;
var margin = { top: 50, left: 50, right: 50, bottom: 20 }
width = 1400 - margin.left - margin.right;
height = 1000 - margin.top - margin.bottom;
var radial_svg, attributes;
var innerRadius = 170;
var outerRadius = Math.min(width, height) / 2.5;
var x, y, z, arc, total;
var xAxis, yAxis, legend, radtooltip;
var count = 0;
var loc
const parseDate = d3.timeParse("%Y-%m-%d %H");

export default function RadialStackedBar(props){
    useEffect(() => {
        radialdata = props.data;
        attributes = ["sewer_and_water", "power", "roads_and_bridges", "buildings", "medical"];

      }, []); 
      loc = props.selectedLocationId

    useEffect(() => {
        updateChart()
    }, [props.selectedLocationId]); 

    

}

function updateChart(){
    d3.select("#radial_svg").selectAll("*").remove();

    radial_svg = d3.select("#radial_svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform",
    "translate(" + (600) + "," + (480) + ")");
    getTotal(loc)

    radial_svg.append("text")
    .attr("class", "chart-label")
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "20px")
    .attr("font-family", "Georgia")
    .attr("x", 0)
    .attr("y", -430)
    .text("Magnitude of Reported Damage Intensities over Time")  
    x = d3.scaleBand()
        .domain(radialdata[loc].map(d => d.time))
        .range([0, 2 * Math.PI])
        .align(0)
    y = d3.scaleRadial()
        .domain([0, d3.max(total)])
        .range([innerRadius, outerRadius])

    arc = d3.arc()
        .innerRadius(function (d) { return y(d[0]); })
        .outerRadius(function (d) { return y(d[1]); })
        // .outerRadius(d => y(d[1]))
        .startAngle(function (d) { return x(d.data.time) })
        .endAngle(d => x(d.data.time) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius)

    z = d3.scaleOrdinal()
        .domain(attributes)
        .range(["#a6cee3", "#1f78b4", "#cab2d6", "#6a3d9a", "#b2df8a"])

        xAxis = g => g
        .attr("text-anchor", "middle")
        .call(g => g.selectAll("g")
            .data(radialdata[loc])
            .join("g")
            .attr("transform", d => `
              rotate(${((x(d.time) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
              translate(${innerRadius},0)
            `)
              .call(g => g.append("line")
                .attr("class", "tickline")
                .attr("x2", -5)
                .attr("stroke", "#fff"))
              .call(g => g.append("text")
                .attr("transform", "rotate(0)translate(-40,-4)")
                .style("font-size", "12px")
                .text(function(d, i) {
                  count += 1
                  if ((count-1) % 6 == 0 && i < radialdata[loc].length - 1) { // show ticks every 6 hours except the last tick
                    return d3.timeFormat("%a %H:%M")(parseDate(d.time));
                  } else if (i == radialdata[loc].length - 1) { // show the last tick instead of the first tick
                    return 
                  }
                }))
    
            .call(g => g.selectAll("text")
                .filter(function() {
                    return this.textContent === "";
                }).remove()))
        .call(g => g.append("text")
            .attr("font-weight", "bold")
            .attr("text-anchor", "center")
            .text("Time"))
            .call(g => g.selectAll(".tickline")
            .attr("stroke", function(d, i) {
                return (i+1) % 6 === 0 ? "#fff" : "#ddd"; // show lines every 6 hours
            })
            .attr("stroke-width", function(d, i) {
                return (i+1) % 6 === 0 ? 0.5 : 0.2; // increase the width for the ticks to be shown
            }))

        .call(g => g.select(".domain")
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1));
    

    yAxis = g => g
        .attr("text-anchor", "middle")
        // .call(g => g.append("text")
        //     .attr("y", d => -y(y.ticks(5).pop()))
        //     .attr("dy", "-1em")
        //     .text("Intensity"))
        .call(g => g.selectAll("g")
            .data(y.ticks(5).slice(1))
            .join("g")
            .attr("fill", "none")
            .call(g => g.append("circle")
                .attr("stroke", "#fff")
                .attr("stroke-opacity", 0.5)
                .attr("r", y))
            .call(g => g.append("text")
                .attr("y", d => -y(d))
                .attr("dy", "0.35em")
                .attr("fill", "#fff")
                .text(y.tickFormat(10, "s"))))

    var attributesForLegend = {"sewer_and_water": "Sewer & Water", 
                                "power": "Power", 
                                "roads_and_bridges": "Roads & Bridges", 
                                "buildings": "Buildings", 
                                "medical": "Medical"};

    legend = g => g.append("g")
        .selectAll("g")
        // .data(attributesForLegend.reverse())
        .data(attributes)
        .join("g")
        .attr("transform", (d, i) => `translate(400,${(i - (attributes.length - 1) / 2) * 20})`)
        .call(g => g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", z))
        .call(g => g.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => attributesForLegend[d]))


    const mouseover = function (event, d) {
        let sum = 0;
        let bar;

        var k = ["sewer_and_water", "power", "roads_and_bridges", "buildings", "medical"];
        for (let i = 0; i < k.length; i++) {
            sum += d.data[k[i]];
            if (sum > d[0]) {
                bar = k[i]
            
                break;
            }
        }

        radtooltip = d3.select("#chart")
            .append("div")
            .attr("class", "radtooltip")
            .style("background-color", "white")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("position", "absolute")
            .style("font-weight", "550")
    
        }
    var mousemove = function(event, d) {
        let bar, sum=0;
        var k = ["sewer_and_water", "power", "roads_and_bridges", "buildings", "medical"];
        for(let i = 0; i < k.length; i++){
            sum +=d.data[k[i]];            
            if (sum > d[0]){
                bar = k[i]
                break;
            }
        }
        radtooltip
        .html(attributesForLegend[bar] + " : " + d.data[bar].toFixed(2))
        .style("background-color", z(bar))
            .style("opacity", 0.9)
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 10 + "px")
    }

    var mouseleave = function (event, d) {
        d3.selectAll(".radtooltip").remove();
    }

    let path = radial_svg.append("g")
        .selectAll("g")
        .data(d3.stack().keys(attributes)(radialdata[loc]))
        .join("g")
        .attr("fill", d => z(d.key));

    path = path.selectAll("path")
        .data(d => d)
        .join("path")
        .attr("d", arc)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


    path.transition()
        .delay(800)
        .duration(3200)
        .ease(d3.easeLinear)
        .attrTween("stroke-dasharray", function () {
            var len = this.getTotalLength();
            // console.log(len);
            return function (d) {
                return (d3.interpolate("0," + len, len + ",0"))(d);
            };
        });

    radial_svg.append("g")
        .call(xAxis);

    radial_svg.append("g")
        .call(yAxis);

    radial_svg.append("g")
            .call(legend);
}
function getTotal(loc) {
    total = []
    for (let i = 0; i < radialdata[loc].length; ++i) {
        total[i] = radialdata[loc][i]["sewer_and_water"] + radialdata[loc][i]["power"] + radialdata[loc][i]["roads_and_bridges"] + radialdata[loc][i]["buildings"] + radialdata[loc][i]["medical"] + radialdata[loc][i]["shake_intensity"]
    }
}