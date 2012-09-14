// Generated by CoffeeScript 1.3.3
(function() {
  var is_number,
    __slice = [].slice;

  console.log("start_b");

  is_number = function(o) {
    return !isNaN((o - 0) && o !== null);
  };

  $(function() {
    var edit_data_change, hide_tabs, make_table, on_corr_method_change, process_id, show_hide_outliers, stats_mdp_change, update_stat_values;
    hide_tabs = function(start) {
      var x, _i, _results;
      _results = [];
      for (x = _i = start; start <= 10 ? _i <= 10 : _i >= 10; x = start <= 10 ? ++_i : --_i) {
        _results.push($("#stats_tabs" + x).hide());
      }
      return _results;
    };
    hide_tabs(1);
    stats_mdp_change = function() {
      var selected;
      selected = $(this).val();
      hide_tabs(0);
      return $("#stats_tabs" + selected).show();
    };
    $(".stats_mdp").change(stats_mdp_change);
    update_stat_values = function(the_values) {
      var category, current_mean, current_median, current_n_of_samples, current_sd, id, in_box, is_odd, median_position, n_of_samples, sd, step_a, step_b, sum, the_mean, the_median, the_values_sorted, total, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      _ref = ['primary_only', 'other_only', 'all_cases'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        category = _ref[_i];
        id = "#" + process_id(category, "mean");
        total = 0;
        _ref1 = the_values[category];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          value = _ref1[_j];
          total += value;
        }
        the_mean = total / the_values[category].length;
        the_mean = the_mean.toFixed(2);
        in_box = $(id).html;
        current_mean = parseFloat($(in_box)).toFixed(2);
        if (the_mean !== current_mean) {
          $(id).html(the_mean).effect("highlight");
        }
        n_of_samples = the_values[category].length;
        id = "#" + process_id(category, "n_of_samples");
        current_n_of_samples = $(id).html();
        if (n_of_samples !== current_n_of_samples) {
          $(id).html(n_of_samples).effect("highlight");
        }
        id = "#" + process_id(category, "median");
        is_odd = the_values[category].length % 2;
        median_position = Math.floor(the_values[category].length / 2);
        the_values_sorted = the_values[category].sort(function(a, b) {
          return a - b;
        });
        if (is_odd) {
          the_median = the_values_sorted[median_position];
        } else {
          the_median = (the_values_sorted[median_position] + the_values_sorted[median_position + 1]) / 2;
        }
        current_median = $(id).html();
        if (the_median !== current_median) {
          $(id).html(the_median).effect("highlight");
        }
        sum = 0;
        _ref2 = the_values[category];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          value = _ref2[_k];
          step_a = Math.pow(value - the_mean, 2);
          sum += step_a;
        }
        step_b = sum / the_values[category].length;
        sd = Math.sqrt(step_b);
        sd = sd.toFixed(2);
        id = "#" + process_id(category, "sd");
        current_sd = $(id).html();
        if (sd !== current_sd) {
          _results.push($(id).html(sd).effect("highlight"));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    edit_data_change = function() {
      var category, checkbox, checked, real_value, row, the_values, value, values, _i, _len;
      the_values = {
        primary_only: [],
        other_only: [],
        all_cases: []
      };
      console.log("at beginning:", the_values);
      values = $('#value_table').find(".edit_strain_value");
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        real_value = $(value).val();
        row = $(value).closest("tr");
        console.log("row is:", row);
        console.log("row[0].id is:", row[0].id);
        category = row[0].id;
        checkbox = $(row).find(".edit_strain_checkbox");
        checked = $(checkbox).attr('checked');
        if (!checked) {
          console.log("Not checked");
          continue;
        }
        if (is_number(real_value) && real_value !== "") {
          real_value = parseFloat(real_value);
          if (_(category).startsWith("Primary")) {
            the_values.primary_only.push(real_value);
          } else if (_(category).startsWith("Other")) {
            the_values.other_only.push(real_value);
          }
          the_values.all_cases.push(real_value);
        }
      }
      console.log("towards end:", the_values);
      return update_stat_values(the_values);
    };
    make_table = function() {
      var header, key, row, row_line, rows, table, the_id, the_rows, value, _i, _len, _ref, _ref1;
      header = "<thead><tr><th>&nbsp;</th>";
      console.log("js_data.sample_groups:", js_data.sample_groups);
      _ref = js_data.sample_groups;
      for (key in _ref) {
        value = _ref[key];
        console.log("aa key:", key);
        console.log("aa value:", value);
        the_id = process_id("column", key);
        header += "<th id=\"" + the_id + "\">" + value + "</th>";
      }
      header += "</thead>";
      console.log("windex header is:", header);
      rows = [
        {
          vn: "n_of_samples",
          pretty: "N of Samples"
        }, {
          vn: "mean",
          pretty: "Mean"
        }, {
          vn: "median",
          pretty: "Median"
        }, {
          vn: "se",
          pretty: "Standard Error (SE)"
        }, {
          vn: "sd",
          pretty: "Standard Deviation (SD)"
        }
      ];
      console.log("rows are:", rows);
      the_rows = "<tbody>";
      console.log("length of rows:", rows.length);
      for (_i = 0, _len = rows.length; _i < _len; _i++) {
        row = rows[_i];
        console.log("rowing");
        row_line = "<tr>";
        row_line += "<td id=\"" + row.vn + "\">" + row.pretty + "</td>";
        console.log("box - js_data.sample_groups:", js_data.sample_groups);
        _ref1 = js_data.sample_groups;
        for (key in _ref1) {
          value = _ref1[key];
          console.log("apple key:", key);
          the_id = process_id(key, row.vn);
          console.log("the_id:", the_id);
          row_line += "<td id=\"" + the_id + "\">foo</td>";
        }
        row_line += "</tr>";
        console.log("row line:", row_line);
        the_rows += row_line;
      }
      the_rows += "</tbody>";
      table = header + the_rows;
      console.log("table is:", table);
      return $("#stats_table").append(table);
    };
    process_id = function() {
      var processed, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      /* Make an id or a class valid javascript by, for example, eliminating spaces
      */

      processed = "";
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        console.log("value:", value);
        value = value.replace(" ", "_");
        if (processed.length) {
          processed += "-";
        }
        processed += value;
      }
      return processed;
    };
    show_hide_outliers = function() {
      var label;
      console.log("FOOBAR in beginning of show_hide_outliers");
      label = $('#show_hide_outliers').val();
      console.log("lable is:", label);
      if (label === "Hide Outliers") {
        return $('#show_hide_outliers').val("Show Outliers");
      } else if (label === "Show Outliers") {
        console.log("Found Show Outliers");
        $('#show_hide_outliers').val("Hide Outliers");
        return console.log("Should be now Hide Outliers");
      }
    };
    on_corr_method_change = function() {
      var corr_method;
      console.log("in beginning of on_corr_method_change");
      corr_method = $('select[name=corr_method]').val();
      console.log("corr_method is:", corr_method);
      $('.correlation_desc').hide();
      return $('#' + corr_method + "_r_desc").show().effect("highlight");
    };
    $('select[name=corr_method]').change(on_corr_method_change);
    console.log("before registering show_hide_outliers");
    $('#show_hide_outliers').click(show_hide_outliers);
    console.log("after registering show_hide_outliers");
    _.mixin(_.str.exports());
    $('#value_table').change(edit_data_change);
    console.log("loaded");
    make_table();
    edit_data_change();
    return console.log("end");
  });

}).call(this);