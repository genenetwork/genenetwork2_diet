// Generated by CoffeeScript 1.3.3
(function() {
  var is_number,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  console.log("start_b");

  is_number = function(o) {
    return !isNaN((o - 0) && o !== null);
  };

  $(function() {
    var block_by_attribute_value, block_by_index, block_outliers, change_stats_value, create_value_dropdown, edit_data_change, export_sample_table_data, get_sample_table_data, hide_no_value, hide_tabs, make_table, on_corr_method_change, populate_sample_attributes_values_dropdown, process_id, reset_samples_table, show_hide_outliers, stats_mdp_change, update_stat_values;
    hide_tabs = function(start) {
      var x, _i, _results;
      _results = [];
      for (x = _i = start; start <= 10 ? _i <= 10 : _i >= 10; x = start <= 10 ? ++_i : --_i) {
        _results.push($("#stats_tabs" + x).hide());
      }
      return _results;
    };
    stats_mdp_change = function() {
      var selected;
      selected = $(this).val();
      hide_tabs(0);
      return $("#stats_tabs" + selected).show();
    };
    change_stats_value = function(sample_sets, category, value_type, decimal_places) {
      var current_value, id, in_box, the_value;
      id = "#" + process_id(category, value_type);
      console.log("the_id:", id);
      in_box = $(id).html;
      current_value = parseFloat($(in_box)).toFixed(decimal_places);
      the_value = sample_sets[category][value_type]();
      if (decimal_places > 0) {
        the_value = the_value.toFixed(decimal_places);
      }
      if (the_value !== current_value) {
        return $(id).html(the_value).effect("highlight");
      }
    };
    update_stat_values = function(sample_sets) {
      var category, stat, _i, _len, _ref, _results;
      _ref = ['primary_only', 'other_only', 'all_cases'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        category = _ref[_i];
        change_stats_value(sample_sets, category, "n_of_samples", 0);
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = ["mean", "median", "std_dev", "std_error"];
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            stat = _ref1[_j];
            _results1.push(change_stats_value(sample_sets, category, stat, 2));
          }
          return _results1;
        })());
      }
      return _results;
    };
    edit_data_change = function() {
      var category, checkbox, checked, real_value, row, sample_sets, value, values, _i, _len;
      sample_sets = {
        primary_only: new Stats([]),
        other_only: new Stats([]),
        all_cases: new Stats([])
      };
      console.log("at beginning:", sample_sets);
      values = $('#value_table').find(".edit_sample_value");
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        real_value = $(value).val();
        row = $(value).closest("tr");
        category = row[0].id;
        checkbox = $(row).find(".edit_sample_checkbox");
        checked = $(checkbox).attr('checked');
        if (checked && is_number(real_value) && real_value !== "") {
          real_value = parseFloat(real_value);
          if (_(category).startsWith("Primary")) {
            sample_sets.primary_only.add_value(real_value);
          } else if (_(category).startsWith("Other")) {
            sample_sets.other_only.add_value(real_value);
          }
          sample_sets.all_cases.add_value(real_value);
        }
      }
      console.log("towards end:", sample_sets);
      return update_stat_values(sample_sets);
    };
    make_table = function() {
      var header, key, row, row_line, rows, table, the_id, the_rows, value, _i, _len, _ref, _ref1;
      header = "<thead><tr><th>&nbsp;</th>";
      console.log("js_data.sample_group_types:", js_data.sample_group_types);
      _ref = js_data.sample_group_types;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
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
          vn: "std_error",
          pretty: "Standard Error (SE)"
        }, {
          vn: "std_dev",
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
        console.log("box - js_data.sample_group_types:", js_data.sample_group_types);
        _ref1 = js_data.sample_group_types;
        for (key in _ref1) {
          if (!__hasProp.call(_ref1, key)) continue;
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
      $('#' + corr_method + "_r_desc").show().effect("highlight");
      if (corr_method === "lit") {
        return $("#corr_sample_method_options").hide();
      } else {
        return $("#corr_sample_method_options").show();
      }
    };
    $('select[name=corr_method]').change(on_corr_method_change);
    create_value_dropdown = function(value) {
      return "<option val=" + value + ">" + value + "</option>";
    };
    populate_sample_attributes_values_dropdown = function() {
      var attribute_info, key, sample_attributes, selected_attribute, value, _i, _len, _ref, _ref1, _results;
      console.log("in beginning of psavd");
      $('#attribute_values').empty();
      sample_attributes = {};
      _ref = js_data.attribute_names;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        attribute_info = _ref[key];
        sample_attributes[attribute_info.name] = attribute_info.distinct_values;
      }
      console.log("[visa] attributes is:", sample_attributes);
      selected_attribute = $('#exclude_menu').val().replace("_", " ");
      console.log("selected_attribute is:", selected_attribute);
      _ref1 = sample_attributes[selected_attribute];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        value = _ref1[_i];
        _results.push($(create_value_dropdown(value)).appendTo($('#attribute_values')));
      }
      return _results;
    };
    populate_sample_attributes_values_dropdown();
    $('#exclude_menu').change(populate_sample_attributes_values_dropdown);
    block_by_attribute_value = function() {
      var attribute_name, cell_class, exclude_by_value,
        _this = this;
      attribute_name = $('#exclude_menu').val();
      exclude_by_value = $('#attribute_values').val();
      cell_class = ".column_name-" + attribute_name;
      return $(cell_class).each(function(index, element) {
        var row;
        if ($.trim($(element).text()) === exclude_by_value) {
          row = $(element).parent('tr');
          return $(row).find(".trait_value_input").val("x");
        }
      });
    };
    $('#exclude_group').click(block_by_attribute_value);
    block_by_index = function() {
      var end_index, index, index_list, index_set, index_string, start_index, _i, _j, _k, _len, _len1, _ref, _results;
      index_string = $('#remove_samples_field').val();
      console.log("index_string is:", index_string);
      index_list = [];
      _ref = index_string.split(",");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        index_set = _ref[_i];
        if (index_set.indexOf('-') !== -1) {
          try {
            start_index = parseInt(index_set.split("-")[0]);
            console.log("start_index:", start_index);
            end_index = parseInt(index_set.split("-")[1]);
            console.log("end_index:", end_index);
            for (index = _j = start_index; start_index <= end_index ? _j <= end_index : _j >= end_index; index = start_index <= end_index ? ++_j : --_j) {
              index_list.push(index);
            }
          } catch (error) {
            alert("Syntax error");
          }
        } else {
          index = parseInt(index_set);
          console.log("index:", index);
          index_list.push(index);
        }
      }
      console.log("index_list:", index_list);
      _results = [];
      for (_k = 0, _len1 = index_list.length; _k < _len1; _k++) {
        index = index_list[_k];
        if ($('#block_group').val() === "primary") {
          console.log("block_group:", $('#block_group').val());
          console.log("row:", $('#Primary_' + index.toString()));
          _results.push($('#Primary_' + index.toString()).find('.trait_value_input').val("x"));
        } else if ($('#block_group').val() === "other") {
          _results.push($('#Other_' + index.toString()).find('.trait_value_input').val("x"));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    $('#block_by_index').click(block_by_index);
    hide_no_value = function() {
      var _this = this;
      return $('.value_se').each(function(_index, element) {
        if ($(element).find('.trait_value_input').val() === 'x') {
          return $(element).hide();
        }
      });
    };
    $('#hide_no_value').click(hide_no_value);
    block_outliers = function() {
      var _this = this;
      return $('.outlier').each(function(_index, element) {
        return $(element).find('.trait_value_input').val('x');
      });
    };
    $('#block_outliers').click(block_outliers);
    reset_samples_table = function() {
      var _this = this;
      return $('.trait_value_input').each(function(_index, element) {
        console.log("value is:", $(element).val());
        $(element).val($(element).data('value'));
        console.log("data-value is:", $(element).data('value'));
        return $(element).parents('.value_se').show();
      });
    };
    $('#reset').click(reset_samples_table);
    get_sample_table_data = function() {
      var other_samples, primary_samples, samples,
        _this = this;
      samples = {};
      primary_samples = [];
      other_samples = [];
      $('#sortable1').find('.value_se').each(function(_index, element) {
        var attribute_info, key, row_data, _ref;
        row_data = {};
        row_data.name = $.trim($(element).find('.column_name-Sample').text());
        row_data.value = $(element).find('.edit_sample_value').val();
        if ($(element).find('.edit_sample_se').length !== -1) {
          row_data.se = $(element).find('.edit_sample_se').val();
        }
        _ref = js_data.attribute_names;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          attribute_info = _ref[key];
          row_data[attribute_info.name] = $.trim($(element).find('.column_name-' + attribute_info.name.replace(" ", "_")).text());
        }
        console.log("row_data is:", row_data);
        return primary_samples.push(row_data);
      });
      console.log("primary_samples is:", primary_samples);
      samples.primary_samples = primary_samples;
      samples.other_samples = other_samples;
      return samples;
    };
    export_sample_table_data = function() {
      var json_sample_data, sample_data;
      sample_data = get_sample_table_data();
      console.log("sample_data is:", sample_data);
      json_sample_data = JSON.stringify(sample_data);
      console.log("json_sample_data is:", json_sample_data);
      return $.ajax({
        url: '/export_trait_data',
        type: 'POST',
        data: "json_data=" + json_sample_data
      });
    };
    $('#export').click(export_sample_table_data);
    console.log("before registering block_outliers");
    $('#block_outliers').click(block_outliers);
    console.log("after registering block_outliers");
    _.mixin(_.str.exports());
    $('#value_table').change(edit_data_change);
    console.log("loaded");
    make_table();
    edit_data_change();
    return console.log("end");
  });

}).call(this);
