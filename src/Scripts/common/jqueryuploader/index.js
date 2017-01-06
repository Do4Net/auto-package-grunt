
/**
公共文件上传工具
依赖：core.js jquery.iframe-transport.js vendor/jquery.ui.widget.js jquery.fileupload.js
**/

//eg.

//<div class="from-upload-btn fileinput-button">
//              <div class="filePicker" id="filePicker">上传</div>      //上传按钮展示
//              <input id="file" type="file" multiple=""                //上传 file标签
//                              data-control="common/jqueryuploader"    //上传控件标识
//                              data-limit-filenum="1"                  //一次上传文件总大小
//                              data-limit-filemax="1"                  //一次上传最大文件数
//                              data-upload-btn="#filePicker"           //绑定上传按钮
//                              data-show-container="#files"            //上传成功后图片展示位置 
//                              data-uploading-msg="上传中..."          //上传中 上传按钮提示
//                              data-uploaded-msg="重新上传"            //上传完成 上传按钮提示
//                              data-upload-type="image"                //上传类型
//                              data-upload-singlefile="true"           //是否为单文件上传 没有该属性 默认对 支持多文件上传
//                              data-target-parameter-name="visaletter" //必填 后台接受图片唯一编号参数名
//                              data-jurl="http://ap.utech.com:8080/files/common/attachment/upload">//上传文件后台提交地址 
//</div>

var Uploader = function () {

    var queueType = {
        "FileUploadAdd": "fileuploadadd",
        "FileUploadDone": "fileuploaddone",
        "FileUploadFail": "fileuploadfail",
        "FileUploadProcessAlways": "fileuploadprocessalways",
        "FileUploadSubmit": "fileuploadsubmit",
        "fileuploadsend": "fileuploadsend"
    };

    var parseControl = function () {
        var uploaders = $("[data-control='common/jqueryuploader']");
        for (var i = uploaders.length - 1; i >= 0; i--) {
            var item = $(uploaders[i]);
            var data = item.data();
            initUploader(item, data);
        }

    };

    function initUploader(item, data) {
        var options = getOption(data);
        if (options == null) {
            return;
        }
        var parent=item.parent();
        item.fileupload(options)
        .on(queueType.FileUploadAdd, function (e, file) {
            var result = checkFile(data, file);
            if (!result) {
                return false;
            }
            $(data.uploadBtn).html(data.uploadingMsg);

        })
        .on(queueType.FileUploadDone, function (e, callbackdata) {
            var container = $(data.showContainer);
            if (container) {
                container.html("");
                $.each(callbackdata.files, function (index, file) {
                    //<div class='img-load'><div class="img"></div><p class="files-tips">login-red-ico.png</p></div>
                    container.append('<p class="files-tips">' + file.name + '</p>');
                });

            }
            if (!callbackdata.result.isSuccess) {
                $(data.uploadBtn).html("上传失败，请稍后再试！");
                return false;
            }

            var fileIdStr = "";
            for (var i = 0; i < callbackdata.result.data.length; i++) {
                var callitem = callbackdata.result.data[i];
                if (callitem.status === 0) {
                    fileIdStr += callitem.uuid + ",";
                } else {
                    console.log("uploading file name :" + callitem.fileName + "is fail");
                }
                
            }
            var hidden = parent.find("[name='" + data.targetParameterName + "']");
            if (hidden) {
                hidden.remove();
            }
            parent.append($("<input type='hidden' name='" + data.targetParameterName + "' value='" + fileIdStr.substring(0, fileIdStr.length - 1) + "' />"));
            $(data.uploadBtn).html(data.uploadedMsg);
        })
        .on(queueType.FileUploadFail, function (e, file) {
            console.log("fail upload file");
            $(data.uploadBtn).html("上传失败，请稍后再试！");
            return false;
        })
        .on(queueType.FileUploadProcessAlways, function (e, file) {

        });

    }

    function checkFile(data, file) {
        if (file.originalFiles.length === 0) {
            console.log("please choose one files!");
            return false;
        }
        //if (data.uploadSinglefile && file.originalFiles.length > 1) {
        //    console.log("please choose only one file!");
        //    return false;
        //}
        
        if (data.limitFilenum && data.limitFilenum < file.originalFiles.length) {
            console.log("limit file num max:" + data.limitFilenum);
            return false;
        }
        var allFileSizeCount = 0;
        for (var i = file.files.length - 1; i >= 0; i--) {
            allFileSizeCount += file.files[i].size;

            var location = file.files[i].name;
            var point = location.lastIndexOf(".");
            var type = location.substr(point).toLowerCase();
            if (!Tools.regConfigs.Photo.test(type)) {
                console.log("Can only upload pictures");
                return false;
            }
        }
        if (data.limitFilemax && data.limitFilemax < allFileSizeCount) {
            console.log("limit file size max:" + data.limitFilemax / 1024 / 1024 + "M");
            return false;
        }

        return true;
    }

    function getOption(data) {
        if (!data.jurl) {
            console.log("can not find fileupload jurl");
            return null;
        }

        if (!data.uploadBtn) {
            console.log("can not find upload button");
            return null;
        }

        data.limitFilemax = data.limitFilemax * 1024 * 1024;

        var option = {
            "url": data.jurl,
            "dataType": 'Json',
            //"contentType ": "text/plain",
            "acceptFileTypes": /(\.|\/)(gif|jpe?g|png)$/i,
            "maxFileSize": data.limitFilemax,
            "disableImageResize": /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
            "previewCrop": true,
            "type": 'POST',
            "formAcceptCharset": "utf-8",
            "singleFileUploads": data.singleFileUploads?true:false
        };

        return option;
    }

    return {
        init: function () {
            $(function () {
                parseControl();
            });
        }
    };
}();

Uploader.init();