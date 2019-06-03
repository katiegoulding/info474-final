'use strict';
// blank js file to be filled with D3 vizzes
(function() {
    let data = "no data";
    let svgContainer = "";
    let mapFunc = "";
    let org_name="API_Chaya"

    window.onload = function() {
        svgContainer = d3.select('body')
          .append('svg')
          .attr('width', 1000)
          .attr('height', 500);
        // d3.csv is basically fetch but it can be be passed a csv file as a parameter
        d3.csv("./data/org_data.csv")
          .then((data) => makeScatterPlot(data));
      }
  
   // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable 

    // get arrays of fertility rate data and life Expectancy data
    let year = data.map((row) => parseFloat(row["year"]));
    let budget_spent = data.map((row) => parseFloat((row["budget_spent"] * -1)));

    // find data limits
    let axesLimits = findMinMax(year, budget_spent);

    // draw axes and return scaling + mapping functions
    mapFunc = drawAxes(axesLimits, "year", "budget_spent");

    // draw drop down box to filter by year
    makeDropDown();

    // plot data as points and add tooltip functionality
    plotData(mapFunc, data);

  }

  function makeDropDown() {
    var dropDown = d3.select("body")
    .append("select")

    var options = dropDown.selectAll('option')
      .data(data)
      .enter()
        .append('option')
    
    options.text(["API_Chaya"], ["Mary's Place"])
        .attr('value', ["API_Chaya"], ["Mary's Place"])

    dropDown.on("change", function () {
          var selected = this.value;
          org_name = selected;
          var data_by_org = data.filter(s => s["org_name"] == selected)
         // svgContainer.selectAll("circle").remove()
          plotData(mapFunc, data_by_org);
    });
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 90)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Budget spent over time");

    svgContainer.append('text')
      .attr('x', 235)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Year');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Budget Spent');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map, thedata) {
    d3.select("div").remove()

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    var data_by_org = data.filter(data => data.org_name === org_name);
    
    var line = d3.line()
    .x(xMap) // set the x values for the line generator
    .y(yMap) // set the y values for the line generator 
    
    svgContainer.append("path")
    .datum(data_by_org) // 10. Binds data to the line 
    .attr("d", line)
    .attr("stroke", "blue")
    .attr("fill", "white")

    // append data to SVG and plot as points
    let circles = svgContainer.selectAll('.dot')
      .data(data_by_org)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 2)
        .attr('fill', "#4286f4")
        .style("opacity", .8)
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
            div.html(
            "Organization: " + d.org_name + "<br/>" +  
            "Year: " + d.year + "<br/>" +  
            "Budget set: " + d.budget_set + "<br/>" +
            "Budget spent: " + d.budget_spent + "<br/>"
            )
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0)
        });

        // draw title and axes labels
        makeLabels();
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - .5, limits.xMax + .5]) // give domain buffer room
      .range([50, 450]);

    // xMap returns a scaled x value from a row of data 
    let xMap = function(d) { return xScale(xValue(d) + 1); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(40, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(90, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();