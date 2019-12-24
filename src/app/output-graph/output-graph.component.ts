import { Component, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import { HttpClient } from "@angular/common/http";
import { interval, Subscription } from "rxjs";
import { data } from "./data";

// Boost(Highcharts);
// noData(Highcharts);
// More(Highcharts);
// noData(Highcharts);

@Component({
  selector: "app-output-graph",
  templateUrl: "./output-graph.component.html",
  styleUrls: ["./output-graph.component.css"]
})
export class OutputGraphComponent implements OnInit {
  subscription: Subscription;
  option: any;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    ["mousemove", "touchmove", "touchstart"].forEach(function(eventType) {
      document
        .getElementById("container")
        .addEventListener(eventType, function(e) {
          var chart, point, i, event;

          for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            // Find coordinates within the chart
            event = chart.pointer.normalize(e);
            // Get the hovered point
            point = chart.series[0].searchPoint(event, true);

            if (point) {
              point.highlight(e);
            }
          }
        });
    });

    /**
     * Override the reset function, we don't need to hide the tooltips and
     * crosshairs.
     */
    Highcharts.Pointer.prototype.reset = function() {
      return undefined;
    };

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    Highcharts.Point.prototype['highlight'] = function(event) {
      event = this.series.chart.pointer.normalize(event);
      this.onMouseOver(); // Show the hover marker
      this.series.chart.tooltip.refresh(this); // Show the tooltip
      this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };
    let activity = data;
    activity.datasets.forEach((dataset, i) => {
      dataset.data = Highcharts.map(dataset.data, function(val, j) {
        return [activity.xData[j], val];
      });

      var chartDiv = document.createElement("div");
      chartDiv.className = "chart";
      document.getElementById("container").appendChild(chartDiv);
      this.option = {
        chart: {
          marginLeft: 40, // Keep all charts left aligned
          spacingTop: 20,
          spacingBottom: 20
        },
        title: {
          text: dataset.name,
          align: "left",
          margin: 0,
          x: 30
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        xAxis: {
          crosshair: true,
          events: {
            setExtremes: e => {
              var thisChart = this.option.chart;

              if (e.trigger !== "syncExtremes") {
                // Prevent feedback loop
                Highcharts.each(Highcharts.charts, function(chart) {
                  if (chart !== thisChart) {
                    if (chart.xAxis[0].setExtremes) {
                      // It is null while updating
                      chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        {
                          trigger: "syncExtremes"
                        }
                      );
                    }
                  }
                });
              }
            }
          },
          labels: {
            format: "{value} km"
          }
        },
        yAxis: {
          title: {
            text: null
          }
        },
        tooltip: {
          positioner: function() {
            return {
              // right aligned
              x: this.chart.chartWidth - this.label.width,
              y: 10 // align to title
            };
          },
          borderWidth: 0,
          backgroundColor: "none",
          pointFormat: "{point.y}",
          headerFormat: "",
          shadow: false,
          style: {
            fontSize: "18px"
          },
          valueDecimals: dataset.valueDecimals
        },
        series: [
          {
            data: dataset.data,
            name: dataset.name,
            type: dataset.type,
            color: Highcharts.getOptions().colors[i],
            fillOpacity: 0.3,
            tooltip: {
              valueSuffix: " " + dataset.unit
            }
          }
        ]
      };
      Highcharts.chart(chartDiv, this.option);
    });
  }
}
