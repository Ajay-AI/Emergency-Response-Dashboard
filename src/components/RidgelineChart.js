import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./css/RidgeLineChart.css";
var svg, tooltip;

export default function RidgelineChart(props) {
  const csvData = props.data;
  const result = new Map();
  var locationId = String(props.selectedLocationId);
  const resultRef = useRef(new Map());

  const margin = { top: 20, right: 20, bottom: 100, left: 50 };
  const width = 700 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  useEffect(() => {
    const processData = (data) => {
      data.sort((a, b) => d3.ascending(a.time, b.time)); // sort data by date
      const intervalMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
      data.forEach((d) => {
        const location = d.location;
        const date = d3.timeFormat("%d-%m-%Y")(new Date(d.time));
        const hour = +d3.timeFormat("%H")(new Date(d.time));
        const intervalStart = Math.floor(hour / 3) * 3; // round down to nearest multiple of 3
        const key = `${date} ${intervalStart.toString().padStart(2, "0")}-${(
          intervalStart + 3
        )
          .toString()
          .padStart(2, "0")}`;
        if (!result.has(location)) {
          result.set(location, new Map());
        }
        const locationMap = result.get(location);
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            sewer_and_water: 0,
            power: 0,
            roads_and_bridges: 0,
            medical: 0,
            buildings: 0,
            shake_intensity: 0,
          });
        }
        const attributes = locationMap.get(key);
        attributes.sewer_and_water += isNaN(d.sewer_and_water)
          ? 0
          : d.sewer_and_water;
        attributes.power += isNaN(d.power) ? 0 : d.power;
        attributes.roads_and_bridges += isNaN(d.roads_and_bridges)
          ? 0
          : d.roads_and_bridges;
        attributes.medical += isNaN(d.medical) ? 0 : d.medical;
        attributes.buildings += isNaN(d.buildings) ? 0 : d.buildings;
        attributes.shake_intensity += isNaN(d.shake_intensity)
          ? 0
          : d.shake_intensity;
      });
      // log the result to the console
      // Rest of the code to render the chart using the processed data
    };

    resultRef.current = result;
    processData(csvData);
    generateRidgelineGraph(locationId);
  }, [locationId]);

  function generateRidgelineGraph(location) {
    
    d3.select("#ridgeline_svg").selectAll("*").remove();
    const locationMap = result.get(parseInt(location));

    const data = [];
    for (const [key, value] of locationMap.entries()) {
      const [date, time] = key.split(" ");
      data.push({ date, time, value });
    }
    // console.log(data);

    const svg = d3
      .select("#ridgeline_svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("fill", "rgba(231, 231, 231, 0.5)");

      svg.append("text")
      .attr("class", "chart-label")
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "20px")
      .attr("font-family", "Georgia")
      .attr("x", width / 2.1)
      .attr("y", 0)
      .text("Distribution of Incident Reports")  
    const buildingsData = data.map((d) => ({
      date: d.date,
      time: d.time,
      value: d.value.buildings,
    }));
    const medicalData = data.map((d) => ({
      date: d.date,
      time: d.time,
      value: d.value.medical,
    }));
    const powerData = data.map((d) => ({
      date: d.date,
      time: d.time,
      value: d.value.power,
    }));
    const roadsAndBridgesData = data.map((d) => ({
      date: d.date,
      time: d.time,
      value: d.value.roads_and_bridges,
    }));
    const sewerAndWaterData = data.map((d) => ({
      date: d.date,
      time: d.time,
      value: d.value.sewer_and_water,
    }));
    const shakeIntensityData = data.map((d) => ({
      date: d.date,
      time: d.time,
      value: d.value.shake_intensity,
    }));

    var attributes = [
      "sewer_and_water",
      "power",
      "roads_and_bridges",
      "buildings",
      "medical",
    ];

    var z = d3
      .scaleOrdinal()
      .domain(attributes)
      // .range(["#98abc5", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
      // .range(d3.schemeSet3);
      .range([
        "#a6cee3",
        "#1f78b4",
        "#cab2d6",
        "#6a3d9a",
        "#b2df8a",
        "#33a02c",
      ]);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => `${d.date} ${d.time}`))
      .range([0, width])
      .paddingInner(0.1)
      .paddingOuter(0.1);

    const yScaleBuildings = d3
      .scaleLinear()
      .domain([0, d3.max(buildingsData, (d) => d.value)])
      .range([height / 6, 0]); // Use 1/6th of the height for buildings

    const yScaleMedical = d3
      .scaleLinear()
      .domain([0, d3.max(medicalData, (d) => d.value)])
      .range([(height / 6) * 2, height / 6]);

    const yScalePower = d3
      .scaleLinear()
      .domain([0, d3.max(powerData, (d) => d.value)])
      .range([(height / 6) * 3, (height / 6) * 2]);

    const yScaleRoadsAndBridges = d3
      .scaleLinear()
      .domain([0, d3.max(roadsAndBridgesData, (d) => d.value)])
      .range([(height / 6) * 4, (height / 6) * 3]); // Use 1/6th of the height for roads_and_bridges

    // Define y-axis scale for "sewer_and_water" attribute
    const yScaleSewerAndWater = d3
      .scaleLinear()
      .domain([0, d3.max(sewerAndWaterData, (d) => d.value)])
      .range([(height / 6) * 5, (height / 6) * 4]); // Use 1/6th of the height for sewer_and_water

    const yScaleShakeIntensity = d3
      .scaleLinear()
      .domain([0, d3.max(shakeIntensityData, (d) => d.value)])
      .range([height, (height / 6) * 5]);

    const buildingsArea = d3
      .area()
      .x((d) => xScale(`${d.date} ${d.time}`) + xScale.bandwidth() / 2)
      .y0((d) => yScaleBuildings(0))
      .y1((d) => yScaleBuildings(d.value))
      .curve(d3.curveBasis);

    const medicalArea = d3
      .area()
      .x((d) => xScale(`${d.date} ${d.time}`) + xScale.bandwidth() / 2)
      .y0((d) => yScaleMedical(0))
      .y1((d) => yScaleMedical(d.value))
      .curve(d3.curveBasis);

    const powerArea = d3
      .area()
      .x((d) => xScale(`${d.date} ${d.time}`) + xScale.bandwidth() / 2)
      .y0((d) => yScalePower(0))
      .y1((d) => yScalePower(d.value))
      .curve(d3.curveBasis);

    const roadsAndBridgesArea = d3
      .area()
      .x((d) => xScale(`${d.date} ${d.time}`) + xScale.bandwidth() / 2)
      .y0((d) => yScaleRoadsAndBridges(0))
      .y1((d) => yScaleRoadsAndBridges(d.value))
      .curve(d3.curveBasis);

    const sewerAndWaterArea = d3
      .area()
      .x((d) => xScale(`${d.date} ${d.time}`) + xScale.bandwidth() / 2)
      .y0((d) => yScaleSewerAndWater(0))
      .y1((d) => yScaleSewerAndWater(d.value))
      .curve(d3.curveBasis);

    const shakeIntensityArea = d3
      .area()
      .x((d) => xScale(`${d.date} ${d.time}`) + xScale.bandwidth() / 2)
      .y0((d) => yScaleShakeIntensity(0))
      .y1((d) => yScaleShakeIntensity(d.value))
      .curve(d3.curveBasis);
    svg
      .append("path")
      .datum(buildingsData)
      .attr("class", "buildings-area")
      .attr("d", buildingsArea)
      .style("fill", z("buildings"));

    svg
      .append("path")
      .datum(medicalData)
      .attr("class", "medical-area")
      .attr("d", medicalArea)
      .style("fill", z("medical"));

    svg
      .append("path")
      .datum(powerData)
      .attr("class", "power-area")
      .attr("d", powerArea)
      .style("fill", z("power"));

    svg
      .append("path")
      .datum(roadsAndBridgesData)
      .attr("class", "roads-bridges-area")
      .attr("d", roadsAndBridgesArea)
      .style("fill", z("roads_and_bridges"));

    svg
      .append("path")
      .datum(sewerAndWaterData)
      .attr("class", "sewer-water-area")
      .attr("d", sewerAndWaterArea)
      .style("fill", z("sewer_and_water"));

    svg
      .append("path")
      .datum(shakeIntensityData)
      .attr("class", "shake-intensity-area")
      .attr("d", shakeIntensityArea)
      .style("fill", z("shake"));

    const xS = d3
      .scaleBand()
      .domain(
        data.map((d) => {
          const format = d3.timeFormat("%a %H:%M"); // Use %a for abbreviated day of the week
          const date = d3.timeParse("%d-%m-%Y %H-%M")(d.date + " " + d.time); // Use d3.timeParse to parse the date and time string
          const hour = d.time.split(":")[0] + ":00"; // Extract the hour value from the time string and add :00
          return (
            format(date)
              .replace(":" + d.time.split(":")[1], "")
              .split(":")[0] + ":00"
          ); // Format the date object, replace the minutes with empty string, and only retrieve the hour value, and add :00
        })
      )
      .range([0, width])
      .paddingInner(0.1)
      .paddingOuter(0.1);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`) // Adjust translate to move x-axis below chart
      .call(
        d3
          .axisBottom(xS)
          .ticks(3)
          .tickValues(xS.domain().filter((d, i) => i % 4 === 0))
      )
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "end")
      .attr("dx", "-1em")
      .attr("dy", "-0.5em");

    // Add labels

    svg
      .append("text")
      .attr("class", "shake-intensity-label")
      .attr("x", -margin.left)
      .attr("y", height - 10)
      .style("fill", "white") // Set the fill color to black
      .text("Shake Magnitude");

    svg
      .append("text")
      .attr("class", "medical-label")
      .attr("x", -margin.left)
      .attr("y", (height / 6) * 2 -10)
      .style("fill", "white")
      .text("Medical");

    svg
      .append("text")
      .attr("class", "power-label")
      .attr("x", -margin.left)
      .attr("y", (height / 6) * 3 - 10)
      .style("fill", "white")
      .text("Power");

    svg
      .append("text")
      .attr("class", "roads-bridges-label")
      .attr("x", -margin.left)
      .attr("y", (height / 6) * 4 -10)
      .style("fill", "white")
      .text("Roads & Bridges");

    svg
      .append("text")
      .attr("class", "sewer-water-label")
      .attr("x", -margin.left)
      .attr("y", (height / 6) * 5 -10)
      .style("fill", "white")
      .text("Sewer & Water");

    svg
      .append("text")
      .attr("class", "buildings-label")
      .attr("x", -margin.left)
      .attr("y", height /6 -10)
      .style("fill", "white")
      .text("Buildings");

    // Append blank y-axes to the SVG container
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

    // Define the scales for the x and y axes
    var tickWidth = width / data.length;

    // Add event listener for mousemove

    svg.on("mouseover", function (event) {
      tooltip = d3
      .select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
      // Check if the mouse is hovering over the buildings graph
      const isBuildingsGraph =
        event.target.classList.contains("buildings-area");

      // Check if the mouse is hovering over the sewer & water graph
      const isSewerWaterGraph =
        event.target.classList.contains("sewer-water-area");

      const isRoadsBridgesGraph =
        event.target.classList.contains("roads-bridges-area");

      const isPowerGraph = event.target.classList.contains("power-area");

      const isMedicalGraph = event.target.classList.contains("medical-area");

      // Check if the mouse is hovering over the shake intensity graph
      const isShakeIntensityGraph = event.target.classList.contains(
        "shake-intensity-area"
      );

      if (isBuildingsGraph) {
        const mouseX = d3.pointer(event)[0];

        const index = Math.floor(mouseX / tickWidth);

        if (index >= 0 && index < data.length) {
          // Get the data of the tick above which the mouse is hovering
          const tickData = data[index];

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              "Date: " +
                tickData.date +
                "<br>Time Period: " +
                tickData.time +
                "<br>No of Reports: " +
                tickData.value.buildings
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        } else {
          tooltip.style("opacity", 0);
        }
      } else if (isSewerWaterGraph) {
        const mouseX = d3.pointer(event)[0];

        const index = Math.floor(mouseX / tickWidth);

        if (index >= 0 && index < data.length) {
          // Get the data of the tick above which the mouse is hovering
          const tickData = data[index];

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              "Date: " +
                tickData.date +
                "<br>Time Period: " +
                tickData.time +
                "<br>No of Reports: " +
                tickData.value.sewer_and_water
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        } else {
          tooltip.style("opacity", 0);
        }
      } else if (isRoadsBridgesGraph) {
        const mouseX = d3.pointer(event)[0];

        const index = Math.floor(mouseX / tickWidth);

        // Check if the index is within the valid range of data array
        if (index >= 0 && index < data.length) {
          // Get the data of the tick above which the mouse is hovering
          const tickData = data[index];

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              "Date: " +
                tickData.date +
                "<br>Time Period: " +
                tickData.time +
                "<br>No of Reports: " +
                tickData.value.roads_and_bridges
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        } else {
          tooltip.style("opacity", 0);
        }
      } else if (isPowerGraph) {
        const mouseX = d3.pointer(event)[0];

        const index = Math.floor(mouseX / tickWidth);

        if (index >= 0 && index < data.length) {
          const tickData = data[index];

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              "Date: " +
                tickData.date +
                "<br>Time Period: " +
                tickData.time +
                "<br>No of Reports: " +
                tickData.value.power
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        } else {
          tooltip.style("opacity", 0);
        }
      } else if (isMedicalGraph) {
        const mouseX = d3.pointer(event)[0];

        const index = Math.floor(mouseX / tickWidth);

        if (index >= 0 && index < data.length) {
          const tickData = data[index];

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              "Date: " +
                tickData.date +
                "<br>Time Period: " +
                tickData.time +
                "<br>No of Reports: " +
                tickData.value.medical
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        } else {
          tooltip.style("opacity", 0);
        }
      } else if (isShakeIntensityGraph) {
        const mouseX = d3.pointer(event)[0];

        const index = Math.floor(mouseX / tickWidth);

        if (index >= 0 && index < data.length) {
          const tickData = data[index];

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              "Date: " +
                tickData.date +
                "<br>Time Period: " +
                tickData.time +
                "<br>No of Reports: " +
                tickData.value.shake_intensity
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        } else {
          tooltip.style("opacity", 0);
        }
      } else {
        tooltip.style("opacity", 0);
      }
    });

    svg.on("mouseout", function () {
      tooltip.remove()
    });
  }

  return <div id="chart"></div>;
}
