import React, { useEffect } from "react";
import * as d3 from "d3";
import "./css/linechart.css";
var csvData, result, svg, startTime, endTime, colorScale;
const standardDeviations = [];
const margin = { top: 20, right: 20, bottom: 100, left: 50 };
const width = 680 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;
var attributes = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"];
const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");

export default function LineChart(props) {
  useEffect(() => {
    csvData = props.data;
    csvData.sort((a, b) => new Date(a.time) - new Date(b.time));
    startTime=csvData[0].time
    const interval = d3.timeMinute.every(5);
    const groupedData = d3.group(csvData, (d) => d.location);

for (const [location, data] of groupedData.entries()) {
  // Group the data by time interval
  const intervalData = d3.group(data, (d) =>
    interval.round(parseDate(d.time))
  );

  // Calculate standard deviation for each interval
  const intervals = Array.from(intervalData.keys());
  const standardDevs = {
    location: location,
    values: intervals.map((interval) => {
      const intervalValues = intervalData.get(interval);
      const values = intervalValues.map((d) => [
        d.sewer_and_water,
        d.power,
        d.roads_and_bridges,
        d.medical,
        d.buildings,
      ]);
      const standardDeviations = d3
        .zip(...values)
        .map((group) => d3.deviation(group));
      return {
        time: interval,
        sewer_and_water: standardDeviations[0],
        power: standardDeviations[1],
        roads_and_bridges: standardDeviations[2],
        medical: standardDeviations[3],
        buildings: standardDeviations[4],
      };
    }),
  };
  standardDeviations.push(standardDevs);
}
    initiateChart();
  }, []); 
  result = new Map();
  var location = props.selectedLocationId;
  useEffect(() => {
    endTime=props.setTime
    console.log(endTime)
    createLineChart(location, endTime);
  }, [props.selectedLocationId, props.setTime]);
}

function initiateChart() {
  svg = d3
    .select("#linechart_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("fill","rgba(231, 231, 231, 0.5)")
    svg.append("text")
        .attr("class", "chart-label")
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "20px")
        .attr("font-family", "Georgia")
        .attr("x", width / 2.2)
        .attr("y", 0)
        .text("Inconsistency in Reported Damage Intensities")  
  svg.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")")
  svg.append("g").attr("class", "y-axis")
  colorScale = d3.scaleOrdinal()
  .domain(['sewer_and_water', 'power', 'roads_and_bridges', 'medical', 'buildings'])
  .range(["#a6cee3","#1f78b4","#cab2d6","#b2df8a","#6a3d9a"]);
  const legend = svg.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${width - margin.right - 100}, ${margin.top})`);
  svg.append("text")
  .attr("class", "y-axis-label")
  .attr("text-anchor", "end")
  .style("fill", "white")
  .style("font-size", "15x")
  .attr("transform", "rotate(-90)")
  .attr("x", -1 * height / 3)
  .attr("y", -20)
  .text("Standard Deviation")

const legendItems = legend.selectAll('.legend-item')
  .data(['Sewer & Water', 'Power', 'Roads & Bridges', 'Medical', 'Buildings'])
  .enter().append('g')
  .attr('class', 'legend-item')
  .attr('transform', (d, i) => `translate(0, ${i * 20})`);

legendItems.append('line')
  .attr('x1', 0)
  .attr('y1', 8)
  .attr('x2', 15)
  .attr('y2', 8)
  .style('stroke', d => colorScale(d))
  .style('stroke-width', 2);

legendItems.append('text')
  .attr('x', 20)
  .attr('y', 12)
  .text(d => d)
  .style('font-size', '12px')
  .style('fill', '#ffffff');

}
function createLineChart(locationId, endTime) {
var chartData = [];
const locationData = standardDeviations.find(d => d.location === locationId);
chartData = locationData.values
.map((d) => ({
  time: d.time,
  sewer_and_water: d.sewer_and_water,
  power: d.power,
  roads_and_bridges: d.roads_and_bridges,
  medical: d.medical,
  buildings: d.buildings,
}))
.filter((d) => d.time >= new Date(endTime) - 12 * 60 * 60 * 1000 && d.time <= new Date(endTime));

  console.log(chartData);

  const xMax = endTime ? new Date(endTime) : new Date();
  const xMin = new Date(xMax.getTime() - 12*60*60*1000); 
  const xScale = d3.scaleTime()
    .domain([xMin, xMax])
    .range([0, width]); // Reverse range to make chart plot from right to left
  
  svg.selectAll(".x-axis")
    .call(d3.axisBottom(xScale)
      .tickValues(d3.timeMinute.every(60).range(xMin, xMax)) // Set tick values to every 15 minutes
      .tickFormat(d3.timeFormat("%a %H:%M"))
      .tickPadding(10));


  const yMax = d3.max(chartData, (d) => {
    const maxVal = d3.max(Object.values(d).slice(1));
    return maxVal;
  });
  const yPadding = yMax * 0.1; 
  const yScale = d3
    .scaleLinear()
    .domain([0, yMax + yPadding])
    .range([height, 0]);  
  svg.selectAll(".y-axis").call(d3.axisLeft(yScale));


  svg.selectAll('.line1')
  .data(attributes)
  .join('path')
  .attr('class', 'line1')
  .attr('fill', 'none')
  .attr('stroke',function(d){
    return colorScale(d)
  })
  .attr('stroke-width', 2)
  .style('opacity', 0.9)
  .attr('d', function(d){
    return d3.line()
      .x(function(dd){
        return xScale(dd.time);
      })
      .y(function(dd){
        return dd[d] !== undefined ? yScale(dd[d]) : yScale(0);
      })
      .curve(d3.curveBasis)(chartData.filter(dd => dd[d] !==  yScale(0)));
  });

  svg
    .select(".x-axis")
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .attr("dx", "-1em")
    .attr("dy", "-1.1em")
    .style("text-anchor", "end");

}


