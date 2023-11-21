import { initiateMapDiagram, updateLocations } from "./map.js";

// DECLARE VARIABLES
var treeMapData, mc_data, pieChartData, multilineData;

document.addEventListener("DOMContentLoaded", function () {
  initiateMapDiagram();
  console.log("yayaya");
});

// IMPLEMENT ALL UTILITY FUNCTIONS BELOW

function slider_on_change() {
  let start = parseInt(document.getElementById("input_slider").min);
  let end = parseInt(document.getElementById("input_slider").value);

  console.log(start);
  console.log(end);
  initiateTreeMap(treeMapData);
  initiateWordCloud(pieChartData, "all", start, end);
  initiatePieChart(pieChartData, start, end);
  initiateSankyChart(multilineData, start, end);
  initiateNetworkChart(multilineData, start, end);
  initiateArcChart();
  initiateMultilineChart(multilineData, start, end);
  updateLocations(end);
}

export function getTranslateString(x, y) {
  return "translate(" + x + "," + y + ")";
}
