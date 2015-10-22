// Generated by CoffeeScript 1.9.2
(function() {
  var create_lod_chart;

  create_lod_chart = function() {
    var chrrect, data, h, halfh, margin, mychart, totalh, totalw, w;
    h = 500;
    w = 1200;
    margin = {
      left: 60,
      top: 40,
      right: 40,
      bottom: 40,
      inner: 5
    };
    halfh = h + margin.top + margin.bottom;
    totalh = halfh * 2;
    totalw = w + margin.left + margin.right;
    console.log("js_data:", js_data);
    mychart = lodchart().lodvarname("lod.hk").height(h).width(w).margin(margin).ylab(js_data.result_score_type + " score").mappingScale(js_data.mapping_scale).manhattanPlot(js_data.manhattan_plot);
    data = js_data.json_data;
    d3.select("div#topchart").datum(data).call(mychart);
    chrrect = mychart.chrSelect();
    chrrect.on("mouseover", function() {
      return d3.select(this).attr("fill", "#E9CFEC");
    }).on("mouseout", function(d, i) {
      return d3.select(this).attr("fill", function() {
        if (i % 2) {
          return "#F1F1F9";
        }
        return "#FBFBFF";
      });
    });
    return mychart.markerSelect().on("click", function(d) {
      var r;
      r = d3.select(this).attr("r");
      return d3.select(this).transition().duration(500).attr("r", r * 3).transition().duration(500).attr("r", r);
    });
  };

  $(function() {
    return root.create_lod_chart = create_lod_chart;
  });

}).call(this);
