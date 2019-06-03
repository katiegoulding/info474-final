'use strict';
// blank js file to be filled with D3 vizzes
(function() {
    let data = "no data";
    let allOrgData = "";
    let svgContainer = "";
    let svgBarChart = "";
    let mapFunc = "";
    let org_name="API_Chaya"
    let div = "";

    window.onload = function() {
        svgContainer = d3.select('body')
          .append('svg')
          .attr('width', 1000)
          .attr('height', 550);

          svgBarChart = d3.select("body")
          .append('svg')
          .attr("width", 500)
          .attr("height", 500)
        // d3.csv is basically fetch but it can be be passed a csv file as a parameter
        d3.csv("./data/org_data.csv")
          .then((data) => makeScatterPlot(data));
      }
  
   // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable 
    allOrgData = csvData
    var data_by_org = data.filter(s => s["org_name"] == org_name)

    // get arrays of fertility rate data and life Expectancy data
    let year = data_by_org.map((row) => parseFloat(row["year"]));
    let budget_spent = data_by_org.map((row) => parseFloat((row["budget_spent"])));

    // find data limits
    let axesLimits = findMinMax(year, budget_spent);

    // draw axes and return scaling + mapping functions
    mapFunc = drawAxes(axesLimits, "year", "budget_spent", svgContainer, {min: 100, max:500}, {min:50, max: 500});

    // draw drop down box to filter by year
    makeDropDown();

    // plot data as points and add tooltip functionality
    plotData(mapFunc, data);

    //makeBarChart(data);
  }

  function makeDropDown() {
    var org = allOrgData.map((row)=>row['org_name'])
    var dropDown = d3.select("body")
     .append("select")


    var distinct = (value,index, self) => {
        return self.indexOf(value)==index
    }

    var distinctOrg = org.filter(distinct)

    var options = dropDown.selectAll('option')
      .data(distinctOrg)
      .enter()
        .append('option')
    
    options.text(function (d) { return d })
        .attr('value', function (d) { return d })

    dropDown.on("change", function () {
          var selected = this.value;
          org_name = selected;
          var data_by_org = data.filter(s => s["org_name"] == selected)

          svgContainer.selectAll("circle").remove()
          svgContainer.selectAll("path").remove()
          svgContainer.selectAll("text").remove()
          svgContainer.selectAll("line").remove()
          
          let year = data_by_org.map((row) => parseFloat(row["year"]));
          let budget_spent = data_by_org.map((row) => parseFloat((row["budget_spent"])));
      
          let axesLimits = findMinMax(year, budget_spent);
      
          // draw axes and return scaling + mapping functions
          mapFunc = drawAxes(axesLimits, "year", "budget_spent", svgContainer, {min: 100, max:500}, {min:50, max: 500});

          plotData(mapFunc, data_by_org);

        //   svgBarChart = d3.select("body")
        //     .append('svg')
        //     .attr("width", 500)
        //     .attr("height", 500)
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
      .attr('x', 280)
      .attr('y', 540)
      .style('font-size', '10pt')
      .text('Year');

    svgContainer.append('text')
      .attr('transform', 'translate(25, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Budget Spent');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map, data) {
    //svgContainer.html("")
   // d3.select("div").remove()

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // filter data by org
    var data_by_org = data.filter(data => data.org_name === org_name);
    
    var line = d3.line()
    .x(xMap) // set the x values for the line generator
    .y(yMap) // set the y values for the line generator 
    
    // create line part of line graph
    svgContainer.append("path")
    .datum(data_by_org)  
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
            div.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px")
                .append(makeBarChart(d.year));

            // div.html(
            // "Organization: " + d.org_name + "<br/>" +  
            // "Year: " + d.year + "<br/>" +  
            // "Budget set: " + d.budget_set + "<br/>" +
            // "Budget spent: " + d.budget_spent + "<br/>"
            // )
            // .style("left", (d3.event.pageX) + "px")
            // .style("top", (d3.event.pageY - 28) + "px");
            
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
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - .5, limits.xMax + .5]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data 
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('d'));
    svg.append("g")
      .attr('transform', 'translate(0,' + rangeY.max + ")")
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ", 0)")
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

  // Make tooltip graph
  function makeBarChart(selected_year) {
    let year_data = data.filter(function(d){return d.year == selected_year;})

    // get an array of bookings completed and an array of bookings attempted
    let bookingsCompleted = year_data.map((row) => parseInt(row["bookings_completed"]));
    let bookingsAttempted = year_data.map((row) => parseInt(row["bookings_attempted"]));

    svgBarChart.selectAll("rect").remove()
    svgBarChart.selectAll("text").remove()
    svgBarChart.selectAll("line").remove()


    let axesLimits = findMinMax(bookingsCompleted, bookingsAttempted);
    
    // draw axes with ticks and return mapping and scaling functions
    let mapFunctions = drawAxes(axesLimits, "bookings_completed", "bookings_attempted", svgBarChart, {min:50, max:250}, {min:50, max:250});

    // plot the data using the mapping and scaling functions
    plotBars(mapFunctions, selected_year);
  }

  function plotBars(map, selected_year) {
    
    let xMap = map.x;
    let yMap = map.y;

    svgBarChart.selectAll('.dot')
    .data(data)
    .enter()
    .append('rect')
      .attr('x', (d) => xMap(d))
      .attr('y', yMap)
      .attr('width', 3)
      .attr('height', (d) => yMap(d))
      .attr("fill", "green")
  
    svgBarChart.append("text")
    .attr("x", 20)
    .attr("y", 30)
    .text("bookings completed vs bookings attempted")
    
    svgBarChart.append("text")
    .attr('transform', 'translate(10, 175)rotate(-90)')
    .text("count")

    svgBarChart.append("text")
    .attr("x", 120)
    .attr("y", 300)
    .text("bookings") 
}
})();