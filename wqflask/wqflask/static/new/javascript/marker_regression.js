// Generated by CoffeeScript 1.3.3
(function() {

  $(function() {
    var Manhattan_Plot, Permutation_Histogram, sort_number;
    sort_number = function(a, b) {
      return a - b;
    };
    Permutation_Histogram = (function() {

      function Permutation_Histogram() {
        this.process_data();
        this.display_graph();
      }

      Permutation_Histogram.prototype.process_data = function() {
        var bars, floored, key, keys, lrs, lrs_array, _i, _j, _len, _len1;
        lrs_array = js_data.lrs_array;
        bars = {};
        for (_i = 0, _len = lrs_array.length; _i < _len; _i++) {
          lrs = lrs_array[_i];
          floored = Math.floor(lrs);
          if (!(floored in bars)) {
            bars[floored] = 0;
          }
          bars[floored] += 1;
        }
        keys = [];
        for (key in bars) {
          keys.push(key);
        }
        keys.sort(sort_number);
        this.bars_ordered = [];
        for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
          key = keys[_j];
          this.bars_ordered.push([parseInt(key), bars[key]]);
        }
        console.log("bars is:", bars);
        console.log("keys are:", keys);
        return console.log("bars_ordered are:", this.bars_ordered);
      };

      Permutation_Histogram.prototype.display_graph = function() {
        return $.jqplot('permutation_histogram', [this.bars_ordered], {
          title: 'Permutation Histogram',
          seriesDefaults: {
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {
              barWidth: 15
            },
            pointLabels: {
              show: true
            }
          },
          axesDefaults: {
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer
          },
          axes: {
            xaxis: {
              min: 0,
              label: "LRS",
              pad: 1.1
            },
            yaxis: {
              min: 0,
              label: "Frequency"
            }
          }
        });
      };

      return Permutation_Histogram;

    })();
    Manhattan_Plot = (function() {

      function Manhattan_Plot() {
        this.process_data();
        this.display_graph();
      }

      Manhattan_Plot.prototype.process_data = function() {
        var mb, qtl_results, result, _i, _len, _results;
        qtl_results = js_data.qtl_results;
        this.plot_points = [];
        this.max_mb = 0;
        _results = [];
        for (_i = 0, _len = qtl_results.length; _i < _len; _i++) {
          result = qtl_results[_i];
          if (result.locus.chromosome === '1') {
            mb = parseInt(result.locus.mb);
            if (mb > this.max_mb) {
              this.max_mb = mb;
            }
            _results.push(this.plot_points.push([mb, result.lrs]));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Manhattan_Plot.prototype.display_graph = function() {
        var x_axis_max, x_axis_ticks, x_tick;
        x_axis_max = Math.ceil(this.max_mb / 25) * 25;
        x_axis_ticks = [];
        x_tick = 0;
        while (x_tick <= x_axis_max) {
          x_axis_ticks.push(x_tick);
          x_tick += 25;
        }
        console.log("x_axis_ticks:", x_axis_ticks);
        console.log("type of x_axis ticks:", typeof x_axis_ticks[0], typeof x_axis_ticks[2]);
        return $.jqplot('manhattan_plot', [this.plot_points], {
          title: '1',
          seriesDefaults: {
            showLine: false,
            markerRenderer: $.jqplot.MarkerRenderer,
            markerOptions: {
              style: "filledCircle",
              size: 3
            }
          },
          axesDefaults: {
            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer
          },
          axes: {
            xaxis: {
              min: 0,
              max: x_axis_max,
              ticks: x_axis_ticks,
              tickOptions: {
                angle: 90,
                showGridline: false,
                formatString: '%d'
              },
              label: "Megabases"
            },
            yaxis: {
              min: 0,
              label: "LRS",
              tickOptions: {
                showGridline: false
              }
            }
          }
        });
      };

      return Manhattan_Plot;

    })();
    new Permutation_Histogram;
    return new Manhattan_Plot;
  });

}).call(this);
