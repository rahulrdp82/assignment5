import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  state = {
    company: "Apple", // Default Company
    selectedMonth: "November", // Default Month
  };

  componentDidMount() {
    if (this.props.csv_data) {
      this.createChart(this.props.csv_data);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.csv_data !== this.props.csv_data ||
      prevState.company !== this.state.company ||
      prevState.selectedMonth !== this.state.selectedMonth
    ) {
      this.createChart(this.props.csv_data);
    }
  }

  handleCompanyChange = (event) => {
    this.setState({ company: event.target.value });
  };

  handleMonthChange = (event) => {
    this.setState({ selectedMonth: event.target.value });
  };

  createChart = (data) => {
    if (!data || data.length === 0) return;

    const { company, selectedMonth } = this.state;

    // Filter data by company and month
    const filteredData = data.filter(
      (item) =>
        item.Company === company &&
        item.Date.toLocaleString("default", { month: "long" }) === selectedMonth
    );

    // Clear previous chart
    d3.select("#chart").selectAll("*").remove();

    // Chart dimensions and margins
    const margin = { top: 20, right: 50, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select("#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(filteredData, (d) => d.Date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => Math.min(d.Open, d.Close)),
        d3.max(filteredData, (d) => Math.max(d.Open, d.Close)),
      ])
      .range([height, 0]);

    // Add X and Y axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d")));

    svg.append("g").call(d3.axisLeft(y));

    // Line generators
    const lineOpen = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Open));

    const lineClose = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Close));

    // Draw Open line
    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "#b2df8a")
      .attr("stroke-width", 2)
      .attr("d", lineOpen);

    // Draw Close line
    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "#e41a1c")
      .attr("stroke-width", 2)
      .attr("d", lineClose);

    // Add circles and tooltips
    svg
      .selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.Date))
      .attr("cy", (d) => y(d.Open))
      .attr("r", 4)
      .attr("fill", "#b2df8a")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `Date: ${d.Date.toLocaleDateString()}<br>Open: ${d.Open}<br>Close: ${d.Close}<br>Diff: ${(
              d.Close - d.Open
            ).toFixed(2)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Add legend
    svg
      .append("rect")
      .attr("x", width - 100)
      .attr("y", 10)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#b2df8a");
    svg
      .append("text")
      .attr("x", width - 80)
      .attr("y", 22)
      .text("Open");

    svg
      .append("rect")
      .attr("x", width - 100)
      .attr("y", 30)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#e41a1c");
    svg
      .append("text")
      .attr("x", width - 80)
      .attr("y", 42)
      .text("Close");
  };

  render() {
    const { company, selectedMonth } = this.state;
    const companies = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      <div className="Child1">
        <div className="controls">
          <h>Company:</h>
          {companies.map((comp) => (
            <label key={comp} style={{ marginRight: 10 }}>
              <input
                type="radio"
                value={comp}
                checked={company === comp}
                onChange={this.handleCompanyChange}
              />
              {comp}
            </label>
          ))}

          <h3>Select Month:</h3>
          <select value={selectedMonth} onChange={this.handleMonthChange}>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <svg id="chart"></svg>
        <div id="tooltip"></div>
      </div>
    );
  }
}

export default Child1;
