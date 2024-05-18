import React, { useState, useEffect } from "react";
import './css/beeswarm_style.css';
import * as d3 from 'd3';

var attributes = ["sewer_and_water", "power", "bridges_and_roads", "medical", "buildings", "shake_intensity"]
var locations;
var csvData, svg
var prevDate = null;
var noOfHoursOfData = 2;
var currentLocation = -1;

export default function BeeswarmBoxPlot(props) {
    useEffect(() => {
        csvData = props.data;
        svg = d3.select("#innovative_svg");
    }, []);
    useEffect(() => {
        var date = new Date(props.setTime);

        if (prevDate != null) {
            var diffInHours = Math.abs((date.getTime() - prevDate.getTime())) / 3600000;
        }

        if (prevDate == null || diffInHours >= 3 || currentLocation != props.selectedLocationId) {
            svg.selectAll("*").remove();
            currentLocation = props.selectedLocationId;
            prevDate = date;
            plotBeeswarmChart(csvData, date.getDate(), date.getHours());
        }
    }, [props.setTime, props.selectedLocationId]);


}

function getAverageReports(report_data, day, hour) {
    var totalData = [];
    for (var i = 0; i < report_data.length; i++) {
        var currentReport = report_data[i];
        var date = new Date(currentReport.time);
        if (date.getDate() == day && (date.getHours() >= hour && date.getHours() <= hour + noOfHoursOfData)) {
            for (var j = 0; j < attributes.length; j++) {
                if (currentReport[attributes[j]] != null) {
                    totalData.push({ location: currentReport.location, value: currentReport[attributes[j]], type: attributes[j] });
                }
            }
        }
    }
    totalData.sort((a, b) => a.location - b.location);
    return totalData;
}

function plotBeeswarmChart(report_data, day, hour) {
    var data = getAverageReports(report_data, day, hour);
    locations = [...new Set(data.map(report => report.location))];
    locations.sort(function (a, b) { return a - b });

    if (data.length > 2000) {
        data = data.filter(() => Math.random() < 0.5).slice(0, 2000);
    }

    
    for(var i = 0; i < locations.length; i++) {
        var locationReports = data.filter(d => d.location == locations[i]); 
        var count = locationReports.length;
        console.log("location ", locations[i]);
        console.log(locationReports);
        if (count < 20) {
           console.log("reached");
           data = data.filter(d => d.location != locations[i]);
           locations = locations.filter(d => d != locations[i]);
        }
        console.log("now count is ", data.filter(d => d.location == locations[i]));
   }

    let margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let width = 1450 - margin.left - margin.right;
    let height = 600 - margin.top - margin.bottom;

    let svg = d3.select("#innovative_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (-1) * height / 2 + ")");

    let xScale = d3.scaleBand().domain(data.map(d => d.location)).range([0, width]).padding(1);
    let yScale = d3.scaleLinear().domain([-1, 10]).range([height, height / 1.5]);

    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale).tickValues(d3.range(0, d3.max(yScale.domain()) + 1));

    let simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => xScale(d.location)))
        .force("y", d3.forceY(d => yScale(d.value)).strength(1))
        .force("collide", d3.forceCollide(5))
        .stop();

    for (let i = 0; i < 100; ++i) {
        simulation.tick();
    }

    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", function (d) {
            if (d.x > xScale(d.location) && d.location != currentLocation) {
                return 4.5;
            } else {
                return 0;
            }
        })
        .style("fill", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("opacity", "0.65");

    var oneLocationData = data.filter(d => d.location === currentLocation);

    svg.selectAll(".currentLocationDots")
        .data(oneLocationData)
        .enter()
        .append("circle")
        .attr("class", "currentLocationDots")
        .attr("r", function (d) {
            if (d.x > xScale(d.location)) {
                return 4.5;
            } else {
                return 0;
            }
        })
        .style("stroke", "black")
        .attr("stroke-width", 2)
        .style("fill", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("opacity", "0.65");

    setInterval(function () {
        svg.selectAll(".currentLocationDots")
            .transition()
            .duration(500)
            .delay((d, i) => i * 50)
            .tween("circle", function (d) {
                let i = d3.interpolateNumber(0, 2 * Math.PI);
                return function (t) {
                    d3.select(this)
                        .attr("cx", d.x + Math.sin(i(t)) * 2)
                        .attr("cy", d.y + Math.cos(i(t)) * 2 + Math.sin(i(t)) * 2)
                };
            });
        svg.selectAll(".dot")
            .transition()
            .duration(500)
            .delay((d, i) => i * 50)
            .tween("circle", function (d) {
                let i = d3.interpolateNumber(0, 2 * Math.PI);
                return function (t) {
                    d3.select(this)
                        .attr("cx", d.x + Math.sin(i(t)) * 2)
                        .attr("cy", d.y + Math.cos(i(t)) * 2 + Math.sin(i(t)) * 2)
                };
            });
    }, 1000);

    drawBoxPlot(svg, data, xScale, yScale);

    svg.append("g").attr("class", "y-axis").style("color", "white").call(yAxis);
    svg.append("g").attr("class", "x-axis").style("color", "white").attr("transform", "translate(0," + height + ")").call(xAxis);
   
    setChartLabel(svg, width, height);
}


function drawBoxPlot(svg, data, xScale, yScale) {

    let boxPlotData = d3.groups(data, d => d.location).map(([location, values]) => {
        values.sort((a, b) => a.value - b.value);
        let q1 = d3.quantile(values.map(d => d.value), 0.25);
        let q2 = d3.quantile(values.map(d => d.value), 0.5);
        let q3 = d3.quantile(values.map(d => d.value), 0.75);
        let iqr = q3 - q1;
        let min = values[0].value > q1 - 1.5 * iqr ? values[0].value : q1 - 1.5 * iqr;
        let max = values[values.length - 1].value < (q3 + 1.5 * iqr) ? values[values.length - 1].value : (q3 + 1.5 * iqr);
        return { location, values, min, q1, q2, q3, max };
    });

    svg.selectAll(".boxPlot")
        .data(boxPlotData)
        .enter()
        .append("rect")
        .attr("class", "boxPlot")
        .attr("x", d => xScale(d.location) - 20)
        .attr("y", d => yScale(d.q3))
        .attr("width", "20")
        .attr("height", d => yScale(d.q1) - yScale(d.q3))
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })
        .attr("stroke-width", 2)
        .attr("fill", "rgba(0, 0, 0, 0.2)");

    svg.selectAll(".medianLine")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("class", "medianLine")
        .attr("x1", d => xScale(d.location) - 20)
        .attr("y1", d => yScale(d.q2))
        .attr("x2", d => xScale(d.location))
        .attr("y2", d => yScale(d.q2))
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })
        .attr("stroke-width", 2)

    svg.selectAll(".upperQuartileLine")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("class", "upperQuartileLine")
        .attr("x1", d => xScale(d.location) - 5)
        .attr("y1", d => yScale(d.q3))
        .attr("x2", d => xScale(d.location))
        .attr("y2", d => yScale(d.q3))
        .attr("stroke-width", 2)
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })

    svg.selectAll(".lowerQuartileLine")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("class", "lowerQuartileLine")
        .attr("x1", d => xScale(d.location) - 5)
        .attr("y1", d => yScale(d.q1))
        .attr("x2", d => xScale(d.location))
        .attr("y2", d => yScale(d.q1))
        .attr("stroke-width", 2)
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })

    svg.selectAll(".upperWhiskerLine")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("class", "upperWhiskerLine")
        .attr("x1", d => xScale(d.location))
        .attr("y1", d => yScale(d.max))
        .attr("x2", d => xScale(d.location))
        .attr("y2", d => yScale(d.q3))
        .attr("stroke-width", 2)
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })

    svg.selectAll(".lowerWhiskerLine")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("class", "lowerWhiskerLine")
        .attr("x1", d => xScale(d.location))
        .attr("y1", d => yScale(d.min))
        .attr("x2", d => xScale(d.location))
        .attr("y2", d => yScale(d.q1))
        .attr("stroke-width", 2)
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })

    svg.selectAll(".upperWhiskerLineHorizontal")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("class", "upperWhiskerLineHorizontal")
        .attr("x1", d => xScale(d.location) - 10)
        .attr("y1", d => yScale(d.max))
        .attr("x2", d => xScale(d.location))
        .attr("y2", d => yScale(d.max))
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })
        .attr("stroke-width", 2)

    svg.selectAll(".lowerWhiskerLineHorizontal")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("class", "lowerWhiskerLineHorizontal")
        .attr("x1", d => xScale(d.location) - 10)
        .attr("y1", d => yScale(d.min))
        .attr("x2", d => xScale(d.location))
        .attr("y2", d => yScale(d.min))
        .style("stroke", function (d) { return d3.schemeSet3[Number(d.location) % 10 + 1] })
        .attr("stroke-width", 2)
}

function setChartLabel(svg, width, height) {
    svg.append("text")
        .attr("class", "xaxislabel")
        .attr("text-anchor", "end")
        .style("fill", "white")
        .style("font-size", "15px")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("locations");
  
  
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "end")
        .style("fill", "white")
        .style("font-size", "15x")
        .attr("transform", "rotate(-90)")
        .attr("x", -1 * height / 1.4)
        .attr("y", -30)
        .text("Damage Intensity")

    svg.append("text")
        .attr("class", "chart-label")
        .attr("text-anchor", "end")
        .style("fill", "white")
        .style("font-size", "20px")
        .attr("font-family", "Georgia")
        .attr("x", width / 1.65)
        .attr("y", height / 1.75)
        .text("Variation in the damage intensity reports")
  }