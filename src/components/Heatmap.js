import React, { useState, useEffect } from "react";
import mapData from "../data/map.geojson";
import * as d3 from "d3";
import "./css/Heatmap.css";
import { sliderBottom } from "d3-simple-slider";
var selectedLocationId, svg, colorScale;
export default function Heatmap(props) {
  const handleLocationClick = (locationId) => {
    props.onLocationIdChange(locationId);
  };
  const margin = { top: 10, right: 50, bottom: 0, left: 50 };
  const width = 680 - margin.left - margin.right;
  const height = 50 - margin.top - margin.bottom;
  const csvData = props.data;
  csvData.sort((a, b) => new Date(a.time) - new Date(b.time));
  const rollupData = d3.rollup(
    csvData,
    (v) => {
      const avgData = {};
      Object.entries(v[0]).forEach(([key, value]) => {
        if (key === "time" || key === "location") {
          avgData[key] = value;
        } else {
          avgData[key] = d3.mean(v, (d) => d[key]);
        }
      });
      avgData["average_damage"] = d3.mean(
        [
          avgData["sewer_and_water"],
          avgData["power"],
          avgData["roads_and_bridges"],
          avgData["medical"],
          avgData["buildings"],
        ].filter((value) => value !== undefined)
      );

      return avgData;
    },
    (d) => d.time + "-" + d.location
  );
  const averagedData = Array.from(rollupData.values());
  const startDate = new Date(averagedData[0].time);
  const endDate = new Date(averagedData[averagedData.length - 1].time);
  var moving = false;
  var timer;
  var playButton = d3.select("#play-button");
  const formatDate = d3.timeFormat("%a");
  const formatTime = d3.timeFormat("%H:%M");
  const sliderTime = sliderBottom()
    .min(startDate)
    .max(endDate)
    .step(1000 * 60 * 5)
    .width(width)
    .tickFormat((d) => {
      return formatDate(d) + " - " + formatTime(d);
    })
    .handle(d3.symbol().type(d3.symbolCircle).size(150)())
    .on("onchange", function (val) {
      updateMap(val);
    })
    .on("drag", function (val) {
      updateMap(val);
      // resetTimer();
    });
  d3.select("#slider-time")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(sliderTime);
  var playButton = d3.select("#play-button");
  playButton.on("click", function () {
    if (moving) {
      clearInterval(timer);
      moving = false;
      playButton.html('<i class="fas fa-play"></i>');
    } else {
      timer = setInterval(update, 1000);
      moving = true;
      playButton.html('<i class="fas fa-pause"></i>');
    }
  });
  function update() {
    var offset = sliderTime.value().valueOf() + 1000 * 60 * 5;
    sliderTime.value(offset);
    updateMap(sliderTime.value());
    if (offset >= endDate.valueOf()) {
      resetTimer();
      // sliderTime.value(startDate.valueOf());
    }
  }
  function resetTimer() {
    moving = false;
    clearInterval(timer);
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    d3.json(mapData).then(function (data) {
      const width = 500,
        height = 450;
      var projection = d3.geoMercator().translate([0, 0]).scale(1);
      const Path = d3.geoPath().projection(projection);
      const BBox = Path.bounds(data);
      var maxdim = Math.max(
        (BBox[1][0] - BBox[0][0]) / width,
        (BBox[1][1] - BBox[0][1]) / height
      );
      var tr = [
        (width - (0.9 / maxdim) * (BBox[1][0] + BBox[0][0])) / 2,
        (height - (0.9 / maxdim) * (BBox[1][1] + BBox[0][1])) / 2,
      ];
      projection.translate(tr).scale(0.9 / maxdim);

      svg = d3
        .select("#mysvg")
        .selectAll(".location")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", Path)
        .attr("class", function(d) {
          return "location" + (d.properties.Id === 2 ? " selected" : "");
        })        .attr("fill", "lightgray")
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .each(function (d) {
          const centroid = Path.centroid(d);
          d3.select(this.parentNode)
            .append("text")
            .text(d.properties.Id)
            .attr("x", centroid[0])
            .attr("y", centroid[1])
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "black")
            .attr("font-size", "12px")
            .attr("pointer-events", "none");
        });
        svg.on("click", function (d) {
          d3.selectAll('.location').classed('selected', false);
          d3.select(this).classed('selected', true);
        
          selectedLocationId = this.__data__.properties.Id;
          handleLocationClick(selectedLocationId)
        });
        
      colorScale = d3
        .scaleSequential()
        .domain([0, 10])
        .interpolator((t) =>
          d3.interpolateRgb("rgb(242, 232, 150)", "rgb(211, 27, 27)")(t)
        );

      let i = 0;

    });
  }, []);
  function updateMap(time) {
    const timeParser = d3.timeFormat("%Y-%m-%d %H:%M:%S");
    time = timeParser(time);
    props.onTimeChange(time)
    const filteredData = averagedData.filter((d) => d.time === time);
    svg.attr("fill", (d) => {
      const locationId = d.properties.Id;
      const locationData = filteredData.find((d) => d.location === locationId);
      return locationData
        ? getColor(locationData.average_damage)
        : "rgb(242, 232, 150)";
    });
  }
  function getColor(value) {
    return colorScale(value);
  }
  return;
}
