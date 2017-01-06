'use strict';
// Source: E:/Code/SourceCode/src/Scripts/common/validate/index.js

// Source: E:/Code/SourceCode/src/Scripts/common/validate/uzai.validate.js
/*
* 创建者：刘建法
* 创建日期：2016年11月18日
* 功能描述：前端 验证控件
* 修改历史：
* *********************************************
* 修改日期   |  作者  |  修改内容 
*/

/* 
	动态配置验证 data-jvalidate 控件 使用方法：
	1 form 标签 
	2 input 标签上添加 data-jvalidate="AccountFormat||AccountEmpty" 值为配置的错误信息 多个以||区分开  触发事件优先级 从右向左 依次覆盖
    3 data-jvalidate-url="http://fx.utour.com/user/TestValidateName" 异步提交到后台验证 后台 get 接受值 data 参数
*/
//依赖 uzai.utils.js
var FormValidate = function () {

    //绑定页面事件
    function bindingEventType() {
        var forms = $("form");
        for (var f = forms.length - 1; f >= 0; f--) {
            var form = forms[f];
            var list = $("*[data-jvalidate]", form);
            var flag = false;
            for (var i = list.length - 1; i >= 0; i--) {
                var item = $(list[i]);
                if (!item) {
                    continue;
                }

                var cvalidate = item.data().jvalidate;
                if (!cvalidate) {
                    continue;
                }

                var datas = cvalidate.split("||");
                if (!datas || datas.length === 0) {
                    continue;
                }

                for (var j = datas.length - 1; j >= 0; j--) {
                    var subItem = datas[j];
                    var errorType = Tools.errorTypeConfig[subItem];
                    if (!errorType || !errorType.BindingEventTypes || !errorType.Regs) {
                        continue;
                    }


                    for (var l = 0; l < errorType.BindingEventTypes.length; l++) {
                        var bindingEventType = errorType.BindingEventTypes[l];
                        if (!bindingEventType) {
                            return;
                        }
                        //(将匿名函数形成一个表达式)
                        (function (errorType, item, bindingEventType) {
                            item.on(bindingEventType, function () {

                                switch (bindingEventType) {
                                    case Tools.eventTypes.Blur: bindingBlurEventImplement(item, errorType); break;
                                    case Tools.eventTypes.KeyUp: bindingKeyUpEventImplement(item, errorType); break;
                                    default: bindingBlurEventImplement(item, errorType); break;
                                }
                            });
                        })(errorType, item, bindingEventType);
                    }

                }
            }
        }
    }

    ///blur 事件 实现 =》验证 管道数据流
    function bindingBlurEventImplement(item, errorType) {
        if (!item) {
            return;
        }

        var text = item.val().replace(Tools.regConfigs.Trim, "");
        var next = item.next();
        if (text === "") {
            deleteNode(next);
            return;
        }

        var before = item.data().jvalidateBefore; 
        if (before && hasError($(before))) {
            return;
        }
        var text2 =$(before).val()===undefined ? "" : $(before).val().replace(Tools.regConfigs.Trim, "");

        var success = execRegular(text, errorType.Regs, errorType.RegsAnd, text2);

        if (!success) {
            deleteNode(next);
            Tools.showError(item, errorType);
        } else {
            deleteNode(next);
        }
        var url = item.data().jvalidateUrl;
        if (success && url) {
            url = url + "?data=" + text;
            Tools.post(url, {}, function (data) {
                if (data && data.ErrorCode && data.ErrorCode != "Success") {
                    Tools.showTip(data.ErrorCode);
                }
            });

        }
    }

    //KeyUp 事件 实现
    function bindingKeyUpEventImplement(item, errorType) {
        if (!item) {
            return;
        }

        if (item.data().controlPwdstrong) {
            checkPasswordStrong(item, errorType);
            return;
        }

        keyUpClearErrorMsg(item, errorType);
    }

    /**
       * 密码强度验证
       item ：当前密码输入框控件
       errorType： 自定义事件类型 BindingEventTypes：KeyUp 
       data-control-pwdstrong="true" 开启密码强度验证 
       data-show-container="#show"   密码强度展示容器
    */
    function checkPasswordStrong(item, errorType) {
        var containerId = item.data().showContainer;
        if (!containerId) {
            return;
        }

        var container = $(containerId);
        var text = item.val().replace(Tools.regConfigs.Trim, "");
        var levels = $(".level", container);
        levels.removeClass('on');
        if (Tools.regConfigs.PwdStrongLevel0.test(text)) { //默认 
            return;
        }

        var success = execRegular(text, errorType.Regs, errorType.RegsAnd);//基本密码验证：8-20位，数字、字母、特殊符号中的至少两种，不能有空格
        if (!success) {
            return;
        }

        if (Tools.regConfigs.PwdStrongLevel2.test(text) || Tools.regConfigs.PwdStrongLevel2_1.test(text)) {//强
            levels.slice(0, 3).addClass("on");
            return;
        }

        if (Tools.regConfigs.PwdStrongLevel1.test(text) || Tools.regConfigs.PwdStrongLevel1_1.test(text)) {//中
            levels.slice(0, 2).addClass("on");
            return;
        }

        levels.slice(0, 1).addClass("on");//弱
    }

    //按键抬起 清空错误信息
    function keyUpClearErrorMsg(item, errorType) {

        var next = item.next();
        deleteNode(next);
        var dataerror = item.attr("data-error");
        if (!dataerror || dataerror.length === 0) {
            return;
        }

        if (dataerror != errorType.Key) {
            return;
        }

        var targetid = item.attr("data-target");
        if (!targetid || targetid === undefined) {
            return;
        }
        var target = $(targetid);
        if (!target) {
            return;
        }

        if (target.attr("data-error") != item.attr("data-error")) {
            return;
        }

        deleteNode(target.next());
    }

    //执行验证
    function execRegular(text, regs, regsAnd,text2) {
        var success = false;
        if (!regs || regs.length === 0) {
            return true;
        }

        for (var h = regs.length - 1; h >= 0; h--) {
            var reg = regs[h];
            //一错即错
            if (regsAnd) {
                if (reg === Tools.regConfigs.Empty) {
                    if (reg.test(text)) {
                        success = false;
                        break;
                    } else {
                        success = true;
                        continue;
                    }
                } else if (reg === Tools.regConfigs.Equal) {
                    if (text != text2) {
                        success = false;
                        break;
                    } else {
                        success = true;
                        continue;
                    }
                }else{
                    if (!reg.test(text)) {
                        success = false;
                        break;
                    } else {
                        success = true;
                        continue;
                    }

                }
            }
            else {//一对即对 
                if (reg === Tools.regConfigs.Empty) {
                    if (reg.test(text) && !success) {
                        continue;
                    } else {
                        success = true;
                        break;
                    }
                } else if (reg === Tools.regConfigs.Equal) {
                    if (text!=text2 && !success) {
                        continue;
                    } else {
                        success = true;
                        break;
                    }
                } else {
                    if (!reg.test(text) && !success) {
                        continue;
                    } else {
                        success = true;
                        break;
                    }

                }
            }
        }
        return success;
    }

    ///验证单个input标签
    function validateInput(isFocus) {
        var item = this;
        var errorIndex = 0;
        if (!item) {
            console.log("需要验证的表单id不能为空！");
            return true;
        }
        var cvalidate = item.attr("data-jvalidate");
        if (!cvalidate) {
            return true;
        }
        var datas = cvalidate.split("||");
        if (!datas || datas.length === 0) {
            return true;
        }

        for (var j = datas.length - 1; j >= 0; j--) {
            var errorType = Tools.errorTypeConfig[datas[j]];
            if (!errorType || !errorType.Commit || !errorType.Regs) {
                continue;
            }
            //隐藏元素不做验证处理 
            if (isHidden(item)) {
                continue;
            }
            var text = item.val().replace(Tools.regConfigs.Trim, "");
           var success = execRegular(text, errorType.Regs, errorType.RegsAnd);

            if (!success) {
                errorIndex++;
                var next = item.next();//
                deleteNode(item.next());
                Tools.showError(item, errorType);
            }

        }
        if (errorIndex > 0 && isFocus) {
            item.focus();
        }
        return errorIndex === 0;
    }
    /*
    表单验证:
        data-jvalidate-before="#Password"  验证该元素前 先验证before元素
    */
    //
    function validateForm() {
        var that = this;
        if (!that) {
            console.log("需要验证的表单id不能为空！");
            return true;
        }
        var firstErrorElem;
        var errorIndex = 0;
        var list = $("[data-jvalidate]", that);// arraySort($("[data-jvalidate]", that), "data-jsort");
        for (var i = 0; i < list.length; i++) {
            var item = $(list[i]);
            var success = true;
            var cvalidate = item.attr("data-jvalidate");
            if (!cvalidate) {
                continue;
            }
            var datas = cvalidate.split("||");
            if (!datas || datas.length === 0) {
                continue;
            }

            for (var j = datas.length - 1; j >= 0; j--) {
                var errorType = Tools.errorTypeConfig[datas[j]];
                if (!errorType || !errorType.Commit || !errorType.Regs) {
                    continue;
                }
                //隐藏元素不做验证处理 
                if (isHidden(item)) {
                    continue;
                }

                var before = item.data().jvalidateBefore; 
                if (before && hasError($(before))) {
                    break;
                }

                var text = item.val().replace(Tools.regConfigs.Trim, "");
                var text2 = $(before).val() === undefined ? "" : $(before).val().replace(Tools.regConfigs.Trim, "");
                success = execRegular(text, errorType.Regs, errorType.RegsAnd, text2);

                if (!success) {
                    if (!firstErrorElem && item.data().errorFocus) {
                        firstErrorElem = item;
                    }
                    errorIndex++;
                    var next = item.next();//
                    deleteNode(item.next());
                    Tools.showError(item, errorType);
                    break;
                } else {
                    deleteNode(item.next());
                }
            }
        }

        if (firstErrorElem) {
            firstErrorElem.trigger("focus");
        }

        return errorIndex === 0;
    }

    //查找元素是否被隐藏  知道查找到最近的一个form
    function isHidden(elem, stop) {

        if (elem === undefined || elem.length === 0) {
            return false;
        }

        if (elem.hasClass("hide") || elem.css("display") === "none") {
            return true;
        }

        if (stop) {
            return false;
        }
        if (elem.is("form")) {
            isHidden(elem.parent(), true);
            return;
        }

        var parent = elem.parent();
        isHidden(parent);
    }

    function hasError(elem) {
        return elem.parent().find(".error-wrap").length > 0;
    }
    //递归删除 错误元素
    function deleteNode(elem) {

        if (elem.hasClass("error-wrap")) {
            elem.remove();
        }

        var next = elem.next();
        if (next.length >= 1) {
            deleteNode(next);
        }

    }
    /*
	数组升序排序
	key值需为数字
	*/
    function arraySort(list, key) {

        if (!list || list.length === 0 || !key) {
            return list;
        }

        list.sort(function (c, next) {
            var k1 = $(c).attr(key);
            var k2 = $(next).attr(key);
            if (!isNaN(Number(k1)) && !isNaN(Number(k2))) {
                k1 = Number(k1);
                k2 = Number(k2);
            }
            if (k1 > k2) { //升序排列
                return 1;
            } else if (k1 < k2) {
                return -1;
            } else {
                return 0;
            }
            //return $(c).attr("data-JSort")>$(next).attr("data-JSort");
        });
        return list;
    }

    return {
        validate: validateForm,
        init: function () {
            $.prototype.validateForm = FormValidate.validate;
            $.prototype.validateInput = validateInput;
            $(function () {
                bindingEventType();
            });
        },
        tip: function (errorTypeKey, isFocus, data, callback) {
            Tools.showTip(errorTypeKey, isFocus, data, callback);
        }
    };
}();

FormValidate.init();


