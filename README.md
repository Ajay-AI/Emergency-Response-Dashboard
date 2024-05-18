# Emergency-Response-Dashboard
A web-based visualization tool to assist emergency responders in the city of St. Himark by visualizing data reported by citizens during an earthquake. The dashboard aims to identify the most affected locations, assess data reliability, and track changes over time using interactive visualizations.

## Objectives

- Provide emergency responders with a comprehensive visualization tool for assessing the impact of disasters
- Enable real-time monitoring of damage reports from different locations
- Facilitate data-driven decision-making for prioritizing response efforts
- Support situational awareness and resource allocation during recovery

## Features

- **Heatmap**: Displays the severity of damages reported in different locations over time, with a linked time slider for dynamic exploration.
- **Lollipop Chart**: Provides a detailed view of damages reported on various infrastructures in the selected location at a particular time.
- **Beeswarm Boxplot**: Combines a boxplot and a beeswarm plot, showing the distribution and statistics of damage reported for all locations over a one-hour period.
- **Line Chart**: Represents the standard deviation of damage reported for various infrastructures at the selected location over the past 12 hours.
- **Ridgeline Chart**: Displays the distribution of the number of damage reports for the entire dataset period, allowing identification of areas requiring immediate attention.
- **Radial Stacked Bar Chart**: Visualizes the magnitude of damage reported for a selected location over time, enabling comparison of different infrastructures.

## Technologies Used

- **React**: A JavaScript library for building user interfaces, used for creating the interactive web application.
- **D3.js**: A JavaScript library for data visualization, utilized for creating interactive and responsive visualizations.

## Installation and Usage

1. Clone the repository: `git clone https://github.com/username/emergency-response-dashboard.git`
2. Navigate to the project directory: `cd emergency-response-dashboard`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Open the application in your web browser at `http://localhost:3000`


## Acknowledgments

- [React Documentation](https://reactjs.org/docs/)
- [Create React App](https://create-react-app.dev/docs/getting-started)
- [d3-simple-slider](https://www.npmjs.com/package/d3-simple-slider)