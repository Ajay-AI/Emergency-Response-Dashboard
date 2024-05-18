// import logo from './logo.svg';
import React, { useState, useEffect, useCallback } from "react";
import * as d3 from "d3";
import data from "./data/mc1-reports-data.csv";
import "./App.css";
import BeeswarmBoxPlot from "./components/BeeswarmBoxPlot";
import HeatMap from "./components/Heatmap";
import LineChart from "./components/LineChart";
import RadialStackedBar from "./components/RadialStackedBar";
import LollipopChart from "./components/LollipopChart";
import RidgelineChart from "./components/RidgelineChart";
import jsonFile from "./data/mc1-reports-radial-v4.json";
import EarthquakeEffect from "./components/general/animation.js";


import backgroundImage from "./images/cracked.jpg";
// import backgroundImage from "./images/earth.jpg";

import earthquakeSound from "./sounds/earthquake_sound.mp3";

const MemoizedHeatMap = React.memo(HeatMap);
function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [radialData, setRadialData] = useState([]);
  const [radialdataLoaded, setRadialDataLoaded] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(2);
  const [time, setTime] = useState("2020-04-06 00:00:00");
  const handleTimeChange = useCallback((time) => {
    setTime(time);
  }, []);
  const handleLocationIdChange = useCallback(
    (locationId) => {
      setSelectedLocationId(locationId);
    },
    [setSelectedLocationId]
  );

  useEffect(() => {
    d3.csv(data, d3.autoType).then((data) => {
      setCsvData(data);
      setDataLoaded(true);
    });

    setRadialData(jsonFile);
    if (radialData) {
      setRadialDataLoaded(true);
    }
  }, []);

  return (

    <div
      className="App"
      style={{
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <h1>Vast 2019 Mini Challenge 1</h1>
      <div className="row">
        <div className="heatmap_row">
          <span className="earthquake-span">
            <svg id="mysvg" width={500} height={450}></svg>
          </span >

          <div id="slider-container">
            <div id="slider-time">
              <button id="play-button">
                <i className="fas fa-play"></i>
              </button>
            </div>
          </div>

          {dataLoaded ? (
            <MemoizedHeatMap
              data={csvData}
              onLocationIdChange={handleLocationIdChange}
              onTimeChange={handleTimeChange}
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div id="lollipop-container">
          <svg id="lollipop_svg"></svg>
        </div>
        {dataLoaded ? (
          <LollipopChart
            data={csvData}
            selectedLocationId={selectedLocationId}
            setTime={time}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <br />

      <div className="innovative_row">
        <div className="innovative_class" style={{ textAlign: "center" }}>
          <svg id="innovative_svg"></svg>
        </div>
        {dataLoaded ? (
          <BeeswarmBoxPlot data={csvData} setTime={time} selectedLocationId={selectedLocationId} />
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <br />
      <br />

      <div className="row">
        <div id="linechart-container">
          <svg id="linechart_svg"></svg>
        </div>
        {dataLoaded ? (
          <LineChart data={csvData} selectedLocationId={selectedLocationId} setTime={time} />
        ) : (
          <p>Loading...</p>
        )}
        <div id="ridgeline-container">
          <svg id="ridgeline_svg"></svg>
        </div>
        {dataLoaded ? (
          <RidgelineChart
            data={csvData}
            selectedLocationId={selectedLocationId}
            setTime={time}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <br />

      <div className="radial_row">
        <div className="radial_div">
          <svg id="radial_svg"></svg>
        </div>
        {radialdataLoaded ? (
          <RadialStackedBar
            data={radialData}
            selectedLocationId={selectedLocationId}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="animation">
        {<EarthquakeEffect />}
      </div>
      <div className="paddingBottom"></div>

      <audio id="myAudio">
        <source src={earthquakeSound} type="audio/mp3"></source>
      </audio>
    </div>
  );
}

export default App;
