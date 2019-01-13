/// Initializations

var pid, allowActions = 1, flash = 0, attempts = 10, allowProcessing = 0, sessionID = randomString(), fileID, sortable = 0, extIndex = {},
    uploadCarousel, maxQueue = 20, uploader, resizeTimeout, winWidth, visibleFiles = 5, convertQueue = [], converting = 0, convertParams = {},
    origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

$(document).ready(function() {
    $(window).bind("resize orientationchange", updateSize).trigger("resize");

    $("#pick-files").button({"icons" : { "primary" : "ui-icon-folder-open" }});
    $("#reset-all").button({"icons" : { "primary" : "ui-icon-close" }}).click(function(e) {
        $(this).blur().trigger("mouseout");
        for (var i = 0; i < uploader.files.length; i++) {
            uploadCarousel.xCarousel("removeItem", "#" + uploader.files[i].id);
        }
        resetUploader();
        e.preventDefault();
    });
    $("#carousel-prev").button({"icons" : { "primary" : "ui-icon-triangle-1-w" }, "text" : false});
    $("#carousel-next").button({"icons" : { "primary" : "ui-icon-triangle-1-e" }, "text" : false});
    $("#download-all").button({ "icons" : { "primary" : "ui-icon-check" } }).click(function(e) {
        var order = [];
        $("#filelist li.plupload_done").each(function() { order.push(this.id); });
        downloadURI("all/" + sessionID + "/" + allName + "?order=" + order.join(",") + "&rnd=" + Math.random(), allName);
        $(this).blur().trigger("mouseout");
        e.preventDefault();
    }).button("disable");

    initUploader();
    updateButtons();

    $.fx.speeds._default = 100;
    
    var extList = supportedFormats.split(", ");
    for (var i=0; i<extList.length; i++) extIndex[extList[i].toLowerCase()] = 1;
});

function initUploader() {
    var settings = {
        runtimes        : "html5,flash",
        browse_button   : "pick-files",
        container       : "upload-buttons-wrapper",
        max_file_size   : sizeLimit,
        url             : origin + "http://jpg2pdf.com/upload/" + sessionID,
        flash_swf_url   : origin + "http://jpg2pdf.com/common/js/plupload2/Moxie.swf",
        multipart       : true,
        dragdrop        : true,
        drop_element    : "container"
    };
    uploader = new plupload.Uploader(settings);

    uploader.bind('Init', function(up, params) {
        if (params.runtime == 'html5') $("#carousel").append('<div id="plupload_drop">' + text["js_dropfiles"] + '</div>');

        up.bind("BeforeUpload", function (up, file) {
            if (up.settings.multipart_params) $.extend(up.settings.multipart_params, {id : file.id});
            else up.settings.multipart_params = {id : file.id};

            var ext = fileExt(file.name);
            if (! ext || ! extIndex[ext]) {
                up.trigger('Error', {
                    code    : plupload.FILE_EXTENSION_ERROR,
                    message : text["js_wrongtype"],
                    file    : file
                });
                return false;
            }
        });

        up.bind("FilesAdded", function(up, files) {
            var delCounter = 0;
            while (up.files.length > maxQueue) {
                up.removeFile(up.files[maxQueue]);
                delCounter++;
            }
            $("#plupload_drop").hide("fade");
            var addCounter = files.length - delCounter;;
            if (typeof(uploadCarousel) == "object") {
                $.each(files, function(i, file) {
                    if (! file || addCounter <= 0 || file.status != 1) return;
                    uploadCarousel.xCarousel("addItem", fileBlock(file));
                    addCounter--;
                    fileStatus(file.id, "uploading");
                });
            } else {
                $.each(files, function(i, file) {
                    if (! file || addCounter <= 0 || file.status != 1) return;
                    $("#filelist").append(fileBlock(file));
                    addCounter--;
                    fileStatus(file.id, "uploading");
                });
                uploadCarousel = $("#carousel").xCarousel({
                    btnPrev         : "#carousel-prev",
                    btnNext         : "#carousel-next",
                    visible         : visibleFiles,
                    updateButtons   : updateButtons
                });
            }
            updateList();
            up.refresh();
            up.start();
        });

        up.bind("UploadProgress", function(up, file) {
            $("#" + file.id + " div.plupload_file_status").html(file.percent + "% " + text["js_of"] + " " + plupload.formatSize(file.size).toUpperCase());
            $("#" + file.id + " div.plupload_file_progress_bar").css("width", file.percent + "%");
            handleStatus(file);
        });

        up.bind("Error", function(up, err) {
            if (err.file) {
                if (err.code == plupload.FILE_SIZE_ERROR) x_prettyError(text["js_toobig"] + ": " + err.file.name);
                if (err.code == plupload.FILE_EXTENSION_ERROR) x_prettyError(text["js_wrongtype"] + ": " + supportedFormats + ".");
                $("#" + err.file.id + ".plupload_delete div.plupload_file_icon").trigger("click")
            }
            up.refresh();
        });

        up.bind("FileUploaded", function(up, file, response) {
            var res = eval(jQuery.parseJSON(response.response));
            if (res === null) return;
            else if (res.data) getAutoConvert(file.id);
            else up.trigger("Error", { file : file, message : res.error.message || text["js_error"] });
        });

        up.bind("UploadFile", function(up, file) {
            $("#" + file.id).addClass("plupload_current_file");
            fileStatus(file.id, "uploading");
        });

        up.bind("StateChanged", function() {
            if (up.state === plupload.STARTED) $("li.plupload_delete a").hide("fade");
            else updateList();
        });

        up.bind("QueueChanged", updateList);
    });

    uploader.init();
}

/// Communications

function getAutoConvert(fid) {
    if (! fid) {
        if (converting) return;
        if (! convertQueue.length) {
            if ($(".success").length && !$(".status-uploading, .status-waiting, .status-converting").length) $("#download-all").button("enable");
            else $("#download-all").button("disable");
            return;
        }
        fid = convertQueue.shift();
        if (! fid || ! $("#" + fid + " .status-waiting").length) getAutoConvert();
    } else if (converting) {
        convertQueue.push(fid);
        fileStatus(fid, "waiting");
        return;
    }
    if (! $("#" + fid).length) return;
    converting = fid;
    fileStatus(fid, "converting");
    x_ajax({
        req : {
            url         : "convert/" + sessionID + "/" + fid,
            type        : "GET",
            data        : convertParams,
            dataType    : "json"
        },
        onData : function (data) {
            getACStatus(fid);
        },
        onError : function () {
            fileStatus(fid, "error");
            converting = 0;
            getAutoConvert();
        },
        onFail : function () {
            fileStatus(fid, "error");
            converting = 0;
            getAutoConvert();
        },
        silent : 1
    });
}

function getACStatus(fid) {
    allowProcessing = fid;
    x_ajax({
        req : {
            url         : "status/" + sessionID + "/" + fid,
            type        : "GET",
            dataType    : "json"
        },
        onData : function (data) {
            setTimeout(getAutoConvert, 0);
            if (typeof data.savings !== "undefined") $("#" + data.fid + " .plupload_thumb_extra").html(data.savings);
            fileStatus(data.fid, data.thumb_url);
            $("#" + data.fid).addClass("success");
            $("#" + data.fid + " .plupload_thumb_wrapper").mouseenter(function() {
                if (thumbnail_clickable && $("#" + data.fid + " .plupload_thumb .status-wrapper").length == 0) {
                    $("#" + data.fid + " .plupload_file_wrapper").addClass("ui-state-active");
                    fileStatus(data.fid, "save");
                }
            }).mouseleave(function() {
                if (thumbnail_clickable && $("#" + data.fid + " .ui-state-active").length > 0) {
                    $("#" + data.fid + " .plupload_file_wrapper").removeClass("ui-state-active");
                    fileStatus(data.fid);
                }
            });
            converting = 0;
            showProgress(data.fid, data.progress);
            $("#" + data.fid + " div.plupload_file_button" + (thumbnail_clickable ? ", #" + data.fid + " .plupload_thumb" : "")).click(function() {
                downloadURI("download/" + data.sid + "/" + data.fid + "/" + data.convert_result + "?rnd=" + Math.random(), data.convert_result);
            });
        },
        onProcessing : function (data) {
            showProgress(data.fid, data.progress);
            if (data.status_text) $("#" + data.fid + " .status-text").html(data.status_text);
        },
        onError : function () {
            fileStatus(fid, "error");
            converting = 0;
            getAutoConvert();
        },
        onFail : function () {
            fileStatus(fid, "error");
            converting = 0;
            getAutoConvert();
        },
        silent : 1
    });
}

/// Functions

function showProgress(fid, progress) {
    if (typeof(progress) === "undefined") progress = 0;
    if (progress < 100) {
        $("#" + fid + " div.plupload_file_button").hide(0, function() {
            $("#" + fid + " div.plupload_file_progress, #" + fid + " div.plupload_file_status").show(0);
        });
    }

    $("#" + fid + " div.plupload_file_progress_bar").css("width", progress + "%");
    var pc = $("#" + fid + " div.plupload_file_status").html();
    $("#" + fid + " div.plupload_file_status").html(pc.replace(/^\d+/, progress));

    if (progress == 100) {
        setTimeout(function() {
            $("#" + fid + " div.plupload_file_progress, #" + fid + " div.plupload_file_status").hide(0, function() {
                $("#" + fid + " div.plupload_file_button").show("fade", 100);
            });
        }, 100);
    }
}

function resetUploader() {
    if (converting) stopConversion(sessionID, converting);
    converting = 0;
    sessionID = randomString();
    uploader.settings.url = origin + "/upload/" + sessionID;
    uploader.splice();
    uploader.refresh();
    convertQueue = [];
    allowProcessing = 0;
    $("#download-all").button("disable");
}

function loadImage(src, callback, loadAttempts) {
    if (loadAttempts <= 0) return;
    $(new Image()).load(function() {
        callback();
    }).attr("src", src).error(function() {
        setTimeout(function(){
            loadImage(src.replace(/\?.*$/, "?" + Math.random()), callback, --loadAttempts);
        }, 200);
    });
}

function fileBlock(file) {
    var shortName;
    if (file.name.length > 16) shortName = file.name.slice(0, 9) + "..." + file.name.slice("-" + 5);
    else shortName = file.name;
    return '<li id="' + file.id + '" class=" plupload_file">' +
        '<div class="plupload_file_wrapper ui-widget ui-state-default ui-corner-all">' +
        '<div class="plupload_file_name"><span title="' + file.name + '">' + shortName + '</span></div>' +
        '<div class="plupload_file_action"><div class="plupload_file_icon ui-icon"></div></div>' +
        '<div class="plupload_clearer"></div>' +
        '<div class="plupload_thumb_wrapper"><div class="plupload_thumb"></div><div class="plupload_thumb_extra"></div></div>' +
        '<div class="plupload_file_button">' + text["js_st_save"] + '</div>' +
        '<div class="plupload_file_progress"><div class="plupload_file_progress_bar" style="width:' + file.percent + '%;"></div></div>' +
        '<div class="plupload_file_status">' + file.percent + '% of ' + plupload.formatSize(file.size).toUpperCase() + '</div>' +
        '</div>' +
    '</li>';
}

function handleStatus(file, image) {
    var actionClass, iconClass;
    if (file.status == plupload.DONE) { actionClass = "plupload_done"; iconClass="ui-icon-circle-close"; }
    if (file.status == plupload.FAILED) { actionClass = "plupload_failed"; iconClass="ui-icon-alert"; }
    if (file.status == plupload.QUEUED) { actionClass = "plupload_delete"; iconClass="ui-icon-circle-minus"; }
    if (file.status == plupload.UPLOADING) { actionClass = "plupload_uploading"; iconClass="ui-icon-circle-arrow-n"; }
    $("#" + file.id).removeClass("plupload_done plupload_failed plupload_delete plupload_uploading").addClass(actionClass);
    $("#" + file.id + " .plupload_file_icon").removeClass("ui-icon-circle-close ui-icon-alert ui-icon-circle-minus ui-icon-circle-arrow-n").addClass(iconClass);
    if (file.hint) $("#" + file.id + " .plupload_file_icon").attr("title", file.hint);
}

function updateList() {
    if (thumbnail_sortable && sortable == 1) {
        $("#filelist").sortable("destroy");
        sortable = 0;
    }
    $.each(uploader.files, function(i, file) {
        handleStatus(file);
        $("#" + file.id + ".plupload_delete div.plupload_file_icon").click(function(e) {
            if ($("#" + file.id + " .plupload_file_wrapper").hasClass("ui-button-inverse")) clearPreview(1);
            uploadCarousel.xCarousel("removeItem", "#" + file.id);
            uploader.removeFile(file);
            if (converting == file.id) {
                converting = 0;
                allowProcessing = 0;
                stopConversion(sessionID, file.id);
            } else {
                removeElem(convertQueue, file.id);
            }
            if (uploader.files.length == 0) resetUploader();
            else getAutoConvert();
            e.preventDefault();
        });
    });
    $("#pick-files").toggleClass("plupload_disabled", uploader.files.length >= maxQueue);
    $("#reset-all").toggleClass("plupload_disabled", uploader.files.length <= 0);
    if (uploader.files.length == 0) {
        $("#plupload_drop").show("fade");
    } else if (thumbnail_sortable) {
        $("#filelist").sortable({helper: "clone", grid: [1, 10000], opacity: 0.6});
        sortable = 1;
    }
    updateButtons();
}

function updateButtons() {
    $("#carousel-prev, #carousel-next, #pick-files, #reset-all").each(function() {
        if ($(this).hasClass("disabled") || $(this).hasClass("plupload_disabled")) {
            try { $(this).button("disable"); } finally {}
        } else {
            try { $(this).button("enable"); } finally {}
        }
    });
    if (typeof uploader == "object") {
        if ($("#pick-files").hasClass("plupload_disabled")) uploader.trigger("DisableBrowse", true);
        else uploader.trigger("DisableBrowse", false);
    }
}

function fileStatus(fid, status) {
    if (status == "uploading" || status == "converting") $("#download-all").button("disable");
    if (status == "waiting") showProgress(fid, 0);
    if (! status) {
        $("#" + fid + " .plupload_thumb").empty();
    } else if (status.indexOf(".") != -1) {
        $("#" + fid + " .plupload_thumb").empty().css({ "background" : "url(" + status + ") center center no-repeat" });
    } else {
        $("#" + fid + " .plupload_thumb").empty().append('<div class="status-wrapper"><div class="status-icon status-' + status + '"></div><div class="status-text">' + text["js_st_" + status] + '</div></div>');
        if (status == "converting") {
            $("#" + fid + " .plupload_file_progress").addClass("progress_extra");
            $("#" + fid + " .plupload_file_progress_bar").css("width", 0);
            var pc = $("#" + fid + " div.plupload_file_status").html();
            $("#" + fid + " div.plupload_file_status").html(pc.replace(/^\d+/, 0));
        }
    }
}

function prettyPopup(url, title) {
    $(".ui-dialog").remove();
    $.get(url, function(text) {
        $("<div />", {
            class       : "pretty-popup"
        }).append("#wrapper").html(text).dialog({
            width       : "90%",
            modal       : false,
            resizable   : false,
            title       : title,
            position    : { "my" : "center", "at" : "center", "of" : window }
        });
    });
}

function updateSize() {
    if (winWidth !== $(window).width()) {
        winWidth = $(window).width();
        updateCarousel();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            updateCarousel();
        }, 100);
    }
}

function updateCarousel() {
    var w = $("#carousel-wrapper").width() - 44;
    $("#container").css({ "width" : w + "px", "left" : 22 + "px" });
    if (Math.floor(w / 156) !== visibleFiles) {
        visibleFiles = Math.floor(w / 156);
        if (typeof(uploadCarousel) == "object") uploadCarousel.xCarousel("setVisible", visibleFiles);
    }
    winWidth = $(window).width();
}

function fileExt(filename) {
    var elems = filename.toLowerCase().split(".");
    return elems.length > 2 && elems[elems.length - 2] == 'tar' ? elems[elems.length - 2] + "." + elems[elems.length - 1] : elems[elems.length - 1];
}

function removeElem(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) arr.splice(i, 1);
    }
}

function downloadURI(uri, name) {
    if (HTMLElement.prototype.click) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(function() { link.remove(); }, 500);
    } else {
        window.location.href = uri;
    }
}

function stopConversion(sid, fid) {
//  $.get("stop/" + sid + "/" + fid + "?rnd=" + Math.random());
}
