// IMPORT STATEMENTS
import { getTranslateString } from "./main.js";

// DECLARE VARIABLES
var abila;
var pointData = [];
// var lineData = [];
var map_svg;
var event_locations;
var time = 61200.0;

// Starter function for Map
export function initiateMapDiagram() {
  var mapMargin = { top: 50, right: 50, bottom: 50, left: 50 };
  var mapWidth = 1180 - mapMargin.left - mapMargin.right;
  var mapHeight = 600 - mapMargin.top - mapMargin.bottom;

  map_svg = d3
    .select("#rick_map")
    .append("svg")
    .attr("width", mapWidth + mapMargin.left)
    .attr("height", mapHeight + mapMargin.bottom)
    .style("background-color", d3.schemePastel2[2])
    .append("g")
    .attr("transform", getTranslateString(mapMargin.left, mapMargin.top / 2));
  map_svg
    .append("text")
    .attr("x", mapWidth + mapMargin.left - 400)
    .attr("y", 20)
    .attr("text-anchor", "end")
    .text("dot size -> number of reports");

  map_svg
    .append("text")
    .attr("x", mapWidth + mapMargin.left - 400)
    .attr("y", 20)
    .attr("text-anchor", "end")
    .text("dot size -> number of reports");

  map_svg
    .append("text")
    .attr("x", mapWidth + mapMargin.left - 100 - 40)
    .attr("y", 20)
    .attr("text-anchor", "end")
    .text("Risk Level");

  map_svg
    .append("text")
    .attr("x", mapWidth + mapMargin.left - 100 - 40)
    .attr("y", 60)
    .attr("text-anchor", "left")
    .text("High");
  map_svg
    .append("text")
    .attr("x", mapWidth + mapMargin.left - 100 - 40)
    .attr("y", mapHeight + mapMargin.bottom - 100 + 50)
    .attr("text-anchor", "left")
    .text("Low");

  var gradient = map_svg
    .append("linearGradient")
    .attr("id", "myGradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", 50)
    .attr("x2", 0)
    .attr("y2", mapHeight + mapMargin.bottom - 100);

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.schemeReds[9][8]);

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.schemeReds[9][0]);

  map_svg
    .append("rect")
    .attr("x", mapWidth + mapMargin.left - 200)
    .attr("y", 50)
    .attr("width", 50)
    .attr("height", mapHeight + mapMargin.bottom - 100)
    .attr("fill", "url(#myGradient)");

  Promise.all([
    d3.json("data/Abila.geojson"),
    d3.csv("data/ccdata_mapCoords.csv"),
  ]).then(function (values) {
    // console.log("values here 1")
    abila = values[0];
    event_locations = values[1];
    // console.log(event_locations);

    viewMap();
    processCoordinates();
    plotLocations();
  });
}

function processCoordinates() {
  // event_locations.forEach(function(record) {
  //     if(record.coordinates){
  //         var coords = JSON.parse(record.coordinates);
  //         if(coords.length==1){
  //             pointData.push(coords);
  //             if(pointDataWithCount.hasOwnProperty(coords)){
  //                 pointDataWithCount[coords]++;
  //             } else{
  //                 pointDataWithCount[coords] = 1;
  //             }
  //         } else if(coords.length==2){
  //             // lineData.push(coords);

  //             coords.forEach(function(singlePoint){
  //                 pointData.push([singlePoint]);
  //                 if(pointDataWithCount.hasOwnProperty([singlePoint])){
  //                     pointDataWithCount[[singlePoint]]++;
  //                 } else{
  //                     pointDataWithCount[[singlePoint]] = 1;
  //                 }
  //             })

  //         }
  //     }
  // });

  event_locations.forEach(function (record) {
    // console.log("records")
    // console.log(record);
    if (
      record.coordinates &&
      parseFloat(record.seconds) <= time &&
      record.coordinates &&
      parseFloat(record.seconds) > time - 60000
    ) {
      var coords = JSON.parse(record.coordinates);
      var riskLevelStr = record.labels;
      var riskLevelVal = 0;
      if (riskLevelStr.includes("emergency")) {
        riskLevelVal += 1;
      }
      if (riskLevelStr.includes("fire")) {
        riskLevelVal += 2;
      }
      if (riskLevelStr.includes("crime")) {
        riskLevelVal += 4;
      }
      // console.log("risk here");
      // console.log(riskLevelVal);
      if (coords.length == 1) {
        let isFound = false;
        pointData.forEach((item) => {
          // console.log("pointdata")
          // console.log(item.data[0])
          var areIdentical =
            item.data[0].length === coords[0].length &&
            item.data[0].every(function (value, index) {
              return value === coords[0][index];
            });

          if (areIdentical) {
            isFound = true;
            item.size += 3;
            item.color += riskLevelVal;
            if (item.color > 8) {
              item.color = 8;
            }
          }
        });
        if (!isFound) {
          pointData.push({
            data: coords,
            color: riskLevelVal,
            size: 1,
            words: record.message,
          });
        }
      } else if (coords.length == 2) {
        coords.forEach((singlePoint) => {
          let isFound = false;
          // console.log("coords")
          // console.log([singlePoint])
          pointData.forEach((item) => {
            var areIdentical =
              item.data[0].length === [singlePoint][0].length &&
              item.data[0].every(function (value, index) {
                return value === [singlePoint][0][index];
              });

            if (areIdentical) {
              // console.log("Multipoint match");
              isFound = true;
              item.size += 3;
              item.color += riskLevelVal;
              if (item.color > 8) {
                item.color = 8;
              }
            }
          });
          if (!isFound) {
            pointData.push({
              data: [singlePoint],
              color: riskLevelVal,
              size: 1,
              words: record.message,
            });
          }
        });
      }
    }
  });
  // console.log("pointData here")
  // console.log(pointData)
}

function viewMap() {
  var projection = d3.geoMercator().fitSize([800, 500], abila);

  // Create the path generator function using the projection function
  var path = d3.geoPath().projection(projection);

  map_svg
    .selectAll("path")
    .data(abila.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "red")
    .style("stroke-width", 1);
}

function plotLocations() {
  let colors = d3.schemeReds[3];
  var projection = d3.geoMercator().fitSize([800, 500], abila);

  console.log("Point Data below");
  console.log(pointData);
  // console.log("Line Data below");
  // console.log(lineData);

  //Adding tooltip html element here
  var tooltip = d3
    .select("#rick_map")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", "1")
    .style("text-align", "center")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("font", "12px")
    .style("border", "2px solid black")
    .style("background", "white")
    .style("border-radius", "5px");

  // var lines = map_svg.selectAll("line")
  //             .data(lineData)
  //             .enter()
  //             .append("line")
  //             .attr("x1", function(d) { return projection(d["data"][0])[0]; })
  //             .attr("y1", function(d) { return projection(d["data"][0])[1]; })
  //             .attr("x2", function(d) { return projection(d["data"][1])[0]; })
  //             .attr("y2", function(d) { return projection(d["data"][1])[1]; })
  //             .attr("stroke", function(d) { return colors[d["color"]]})
  //             .style("z-index", "1")
  //             .attr("stroke-width", 2);

  // locs = [[24.871374, 36.051901], [24.858964, 36.08652]];
  var dots = map_svg
    .selectAll("circle")
    .data(pointData)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return projection(d["data"][0])[0];
    })
    .attr("cy", function (d) {
      return projection(d["data"][0])[1];
    })
    .attr("r", function (d) {
      return d["size"] * 3;
    })
    .style("fill", function (d) {
      return colors[d["color"]];
    })
    .style("opacity", function (d) {
      if (d["size"] > 2) {
        return "0.5";
      }
    })
    .on("mouseover", function (event, d) {
      var tipWidth = d.words.length * 6 + 20;
      tooltip
        .style("opacity", "0.8")
        .style("visibility", "visible")
        // .style('height', 35+'px')
        .style("width", tipWidth + "px");
      tooltip
        .html("<p>" + d.words + "</p>")
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 10 + "px");

      d3.select(this).style("stroke-width", "1");
    })
    .on("mouseout", function (d) {
      tooltip.style("visibility", "hidden");
      d3.select(this).style("stroke-width", "0");
    });
}

export function updateLocations(secondsTime) {
  let colors = d3.schemeReds[9];

  time = secondsTime;

  pointData = [];

  var projection = d3.geoMercator().fitSize([800, 500], abila);

  processCoordinates();

  // console.log("Point Data below");
  // console.log(pointData);
  // console.log("Line Data below");
  // console.log(lineData);

  //Adding tooltip html element here
  // var tooltip = d3.select('#rick_map').append('div')
  //             .attr('class', 'tooltip')
  //             .style('opacity','1')
  //             .style("text-align", "center")
  //             .style('position', 'absolute')
  //             .style('visibility', 'hidden')
  //             .style('font', '12px')
  //             .style('border', '2px solid black')
  //             .style('background', 'white' )
  //             .style('border-radius', '5px');

  // var lines = map_svg.selectAll("line")
  //             .data(lineData)
  //             .enter()
  //             .append("line")
  //             .attr("x1", function(d) { return projection(d["data"][0])[0]; })
  //             .attr("y1", function(d) { return projection(d["data"][0])[1]; })
  //             .attr("x2", function(d) { return projection(d["data"][1])[0]; })
  //             .attr("y2", function(d) { return projection(d["data"][1])[1]; })
  //             .attr("stroke", function(d) { return colors[d["color"]]})
  //             .style("z-index", "1")
  //             .attr("stroke-width", 2);

  // locs = [[24.871374, 36.051901], [24.858964, 36.08652]];
  map_svg.selectAll("circle").remove();

  var dots = map_svg
    .selectAll("circle")
    .data(pointData)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return projection(d["data"][0])[0];
    })
    .attr("cy", function (d) {
      return projection(d["data"][0])[1];
    })
    .attr("r", function (d) {
      return d["size"] * 3;
    })
    .style("fill", function (d) {
      return colors[d["color"]];
    })
    .style("opacity", function (d) {
      if (d["size"] > 2) {
        return "0.5";
      }
    })
    .on("mouseover", function (event, d) {
      var tipWidth = d.words.length * 6 + 20;
      tooltip
        .style("opacity", "0.8")
        .style("visibility", "visible")
        // .style('height', 35+'px')
        .style("width", tipWidth + "px");
      tooltip
        .html("<p>" + d.words + "</p>")
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 10 + "px");

      d3.select(this).style("stroke-width", "1");
    })
    .on("mouseout", function (d) {
      tooltip.style("visibility", "hidden");
      d3.select(this).style("stroke-width", "0");
    });
}
