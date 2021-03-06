submit_special = ->
        # Add submit_special class plus a data-url field to any button
        # And it will submit to that url
        # No js changes necessary
        console.log("In submit_special")
        console.log("this is:", this)
        console.log("$(this) is:", $(this))
        url = $(this).data("url")
        console.log("url is:", url)
        $("#trait_data_form").attr("action", url);
        $("#trait_data_form").submit()

update_time_remaining = (percent_complete) ->
        now = new Date()
        period = now.getTime() - root.start_time
        console.log("period is:", period)
        if period > 8000
            total_seconds_remaining = (period / percent_complete * (100 - percent_complete))/1000
            minutes_remaining = Math.round(total_seconds_remaining / 60)
            #seconds_remaining = Math.round(total_seconds_remaining % 60)
            #console.log("seconds_remaining:", seconds_remaining)
            if minutes_remaining < 3
                $('#time_remaining').text(Math.round(total_seconds_remaining) + " seconds remaining")
            else
                $('#time_remaining').text(minutes_remaining + " minutes remaining")

get_progress = ->
        console.log("temp_uuid:", $("#temp_uuid").val())
        temp_uuid = $("#temp_uuid").val()
        params = { key:temp_uuid }
        params_str = $.param(params)
        url = "/get_temp_data?" + params_str
        console.log("url:", url)
        $.ajax(
            type: "GET"
            url: url
            success: (progress_data) =>
                percent_complete = progress_data['percent_complete']
                console.log("in get_progress data:", progress_data)

                $('#marker_regression_progress').css("width", percent_complete + "%")
                
                if root.start_time
                    unless isNaN(percent_complete)
                        update_time_remaining(percent_complete)
                else
                    root.start_time = new Date().getTime()
        )
        return false

##Block Outliers Code
block_outliers = ->
        $('.outlier').each (_index, element) =>
            $(element).find('.trait_value_input').val('x')
            
do_ajax_post = (url, form_data) ->
        $.ajax(
            type: "POST"
            url: url
            data: form_data
            error: (xhr, ajaxOptions, thrownError) =>
                alert("Sorry, an error occurred")
                console.log(xhr)
                clearInterval(this.my_timer)
                $('#progress_bar_container').modal('hide')
                $('#static_progress_bar_container').modal('hide')
                $("body").html("We got an error.")        
            success: (data) =>
                clearInterval(this.my_timer)
                $('#progress_bar_container').modal('hide')
                $('#static_progress_bar_container').modal('hide')
                open_mapping_results(data)
                #$("body").html(data)
        )
        console.log("settingInterval")
        
        this.my_timer = setInterval(get_progress, 1000)
        return false

open_mapping_results = (data) ->
    #results_window = window.open("/mapping_results_container")
    #results_window.onload = ->
    #    results_window.document.getElementById("mapping_results_container").innerHTML = data

    $.colorbox(
       html: data
       href: "#mapping_results_holder"
       height: "90%"
       width: "90%"
       onComplete: =>
          root.create_lod_chart()

          #Set filename
          filename = "lod_chart_" + js_data.this_trait

          getSvgXml = ->
              svg = $("#topchart").find("svg")[0]
              (new XMLSerializer).serializeToString(svg)

          $("#exportform > #export").click =>
              svg_xml = getSvgXml()
              form = $("#exportform")
              form.find("#data").val(svg_xml)
              form.find("#filename").val(filename)
              form.submit()

          $("#exportpdfform > #export_pdf").click =>
              svg_xml = getSvgXml()
              form = $("#exportpdfform")
              form.find("#data").val(svg_xml)
              form.find("#filename").val(filename)
              form.submit()
     )

outlier_text = "One or more outliers exist in this data set. Please review values before mapping. \
                  Including outliers when mapping may lead to misleading results. \
                  We recommend <A HREF=\"http://en.wikipedia.org/wiki/Winsorising\">winsorising</A> the outliers \
                  or simply deleting them."

showalert = (message,alerttype) ->
    $('#alert_placeholder').append('<div id="alertdiv" class="alert ' +  alerttype + '"><a class="close" data-dismiss="alert">�</a><span>'+message+'</span></div>')
    

$('#suggestive').hide()

$('input[name=display_all]').change(() =>
        console.log("check")
        if $('input[name=display_all]:checked').val() == "False"
            $('#suggestive').show()
        else
            $('#suggestive').hide()
)

$("#pylmm_mapping_compute").on("mouseover", =>
        if ( $(".outlier").length and $(".outlier-alert").length < 1 ) 
            showalert(outlier_text, "alert-success outlier-alert")
)

$("#pylmm_compute").on("click", =>
        $("#progress_bar_container").modal()
        url = "/marker_regression"
        $('input[name=method]').val("pylmm")
        $('input[name=num_perm]').val($('input[name=num_perm_pylmm]').val())
        $('input[name=manhattan_plot]').val($('input[name=manhattan_plot_pylmm]:checked').val())
        form_data = $('#trait_data_form').serialize()
        console.log("form_data is:", form_data)
        
        #remove_outliers = confirm("Remove outliers?")
        #if use_outliers == true
        #    block_outliers()
        do_ajax_post(url, form_data)
)

    
$("#rqtl_geno_compute").on("click", =>
        $("#progress_bar_container").modal()
        url = "/marker_regression"
        $('input[name=method]').val("rqtl_geno")
        $('input[name=num_perm]').val($('input[name=num_perm_rqtl_geno]').val())
        $('input[name=manhattan_plot]').val($('input[name=manhattan_plot_rqtl]:checked').val())
        $('input[name=control_marker]').val($('input[name=control_rqtl_geno]').val())
        form_data = $('#trait_data_form').serialize()
        console.log("form_data is:", form_data)
        
        #remove_outliers = confirm("Remove outliers?")
        #if use_outliers == true
        #    block_outliers()
        do_ajax_post(url, form_data)
)


$("#plink_compute").on("click", =>
        $("#static_progress_bar_container").modal()
        url = "/marker_regression"
        $('input[name=method]').val("plink")
        #$('input[name=mapping_display_all]').val($('input[name=display_all_plink]').val())
        #$('input[name=suggestive]').val($('input[name=suggestive_plink]').val())
        $('input[name=maf]').val($('input[name=maf_plink]').val())
        form_data = $('#trait_data_form').serialize()
        console.log("form_data is:", form_data)
        
        do_ajax_post(url, form_data)
)

$("#gemma_compute").on("click", =>
        console.log("RUNNING GEMMA")
        $("#static_progress_bar_container").modal()
        url = "/marker_regression"
        $('input[name=method]').val("gemma")
        #$('input[name=mapping_display_all]').val($('input[name=display_all_gemma]').val())
        #$('input[name=suggestive]').val($('input[name=suggestive_gemma]').val())
        $('input[name=maf]').val($('input[name=maf_gemma]').val())
        form_data = $('#trait_data_form').serialize()
        console.log("form_data is:", form_data)
        
        do_ajax_post(url, form_data)
)

$("#interval_mapping_compute").on("mouseover", =>
        if ( $(".outlier").length and $(".outlier-alert").length < 1 ) 
            showalert(outlier_text, "alert-success outlier-alert")
)

$("#interval_mapping_compute").on("click", =>
        console.log("In interval mapping")
        $("#progress_bar_container").modal()
        url = "/interval_mapping"
        
        $('input[name=method]').val("reaper")
        $('input[name=manhattan_plot]').val($('input[name=manhattan_plot_reaper]:checked').val())
        $('input[name=mapping_display_all]').val($('input[name=display_all_reaper]'))
        $('input[name=suggestive]').val($('input[name=suggestive_reaper]'))
        form_data = $('#trait_data_form').serialize()
        console.log("form_data is:", form_data)
        
        do_ajax_post(url, form_data)
)

#$(".submit_special").click(submit_special)

composite_mapping_fields = ->
        $(".composite_fields").toggle()
mapping_method_fields = ->
        $(".mapping_method_fields").toggle()
        

$("#use_composite_choice").change(composite_mapping_fields)
$("#mapping_method_choice").change(mapping_method_fields)


#### Todo: Redo below so its like submit_special and requires no js hardcoding
toggle_enable_disable = (elem) ->
        $(elem).prop("disabled", !$(elem).prop("disabled"))
    
$("#choose_closet_control").change(->
        toggle_enable_disable("#control_locus")
)
    
$("#display_all_lrs").change(->
        toggle_enable_disable("#suggestive_lrs")
);
