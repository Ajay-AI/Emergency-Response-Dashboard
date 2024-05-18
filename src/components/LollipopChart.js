import * as d3 from 'd3';
import React, { useState, useEffect } from "react";
import './css/lollipop.css';
var margin = { top: 20, right: 0, bottom: 20, left: 20 };
var width = 630;
var height = 450;
var startDate, filteredData;
var attributes = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"];
var Xattributes = ["Sewer & Water", "Power", "Roads & Bridges", "Medical", "Buildings"];
var xScale = d3.scaleBand().domain(Xattributes).range([margin.left, 0.95 * width]).padding(0.1);
var yScale = d3.scaleLinear().domain([0, 10]).range([height - margin.bottom, margin.top]);
var svg

export default function LollipopChart(props) {
    useEffect(() => {
        filteredData = props.data;
        initiateChart();
        // updateChart(props, props.selectedLocationId, props.setTime);
    }, []);
    useEffect((e) => {
        updateChart(props, props.selectedLocationId, props.setTime);
    }, [props.selectedLocationId, props.setTime]);

}
function initiateChart() {
    svg = d3.select("#lollipop_svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate("  + margin.left + "," + 0 + ")");
    svg.append("g").attr("class", "x-axis").attr("transform", "translate(" + 0 + "," + (height - margin.bottom) + ")").call(d3.axisBottom(xScale));
    svg.append("g").attr("class", "y-axis").attr("transform", "translate(" + margin.left + "," + 0 + ")")
    svg.selectAll(".y-axis").call(d3.axisLeft().scale(yScale));
    svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("x", -1 * height / 2.7)
    .attr("y", -5)
    .text("Damage Intensity")
}



function updateChart(props, selectedLocation = "all", startDate = "1990-04-11 00:00:00") {

    var selectedLocation;

    filteredData = (props.data).filter(function (d) {
        return d.location == selectedLocation && d.time == startDate;
    });
    var averageValues = attributes.map(function (attribute) {
        return d3.mean(filteredData, function (d) {
            return d[attribute];
        });
    });

    var colorScale = d3.scaleOrdinal()
        .domain(Xattributes)
        .range(["#a6cee3", "#1f78b4", "#cab2d6", "#b2df8a", "#6a3d9a"]);


    svg.selectAll(".mycircle")
        .data(averageValues)
        .join("circle")
        .attr("cx", function (d, i) {
            return xScale(Xattributes[i]) + xScale.bandwidth() / 2;
        })
        .transition()
        .duration(500)
        .attr("cy", function (d) {
            if (d)
                return yScale(d);
            else
                return yScale(0)
        })
        .attr("r", 6)
        .style('fill',  function(d, i) {
            return colorScale(Xattributes[i]);
        })
        .style('stroke', "black")
        .attr("class", "mycircle");

    svg.selectAll(".myline")
        .data(averageValues)
        .join("line")
        .transition()
        .duration(500)
        .attr("x1", function (d, i) {
            return xScale(Xattributes[i]) + xScale.bandwidth() / 2;
        })
        .attr("x2", function (d, i) {
            return xScale(Xattributes[i]) + xScale.bandwidth() / 2;
        })
        .attr("y2", yScale(0))
        .attr("y1", function (d) {
            if (d)
                return yScale(d);
            else
                return yScale(0)
        })
        .style('stroke',  function(d, i) {
            return colorScale(Xattributes[i]);
        })
        .attr("stroke-width", "2")
        .attr("class", "myline");


}

