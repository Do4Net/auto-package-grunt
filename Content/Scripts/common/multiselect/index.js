'use strict';
// Source: E:/Code/SourceCode/src/Scripts/common/multiselect/index.js
/*
* 创建者：刘建法
* 创建日期：2016年12月22日
* 功能描述：前端 多级联动
* 修改历史：
* *********************************************
* 修改日期   |  作者  |  修改内容 
*/
/* 
    使用说明：
    data-control="common/multiselect" 标示 为多级联动控件 只需要在一组联动首个select 上打标记 首个select数据从后台页面初始化的时候绑定上 <option  value="1">河北</option> 给value赋值 主键
    data-target-children="#c2"  绑定其下的联动子 select 标签
    data-target-parent="#f1" 绑定使他触发数据变化的 父标签 
    data-target-parameter-name 以get方式 提交到后台的参数名称 如果没有设置 默认参数名为pid
    data-jurl="http://fx.utour.com/user/GetCity" 联动获取数据源  默认后台接受参数：如果 控件上指定参数侧用指定 无指定默认为pid; 接受参数方式：get

    eg.
     <select   class="form-control"  
            id="f1"  
            data-control="common/multiselect" 
            data-target-children="#c1">
                <option  value="1">河北</option>
                <option  value="2">河南</option> 
     </select>
    <select class="form-control" 
            id="c1" 
            data-target-children="#c2" 
            data-target-parent="#f1"
            data-jurl="http://fx.utour.com/user/GetCity">
   </select>
*/
var MultiSelect = function () {
    var optionTemplate = "<option value='[Id]'>[Name]</option>";

	var parseControl=function(){
		var multiSelects=$("[data-control='common/multiselect']");
		for (var i = multiSelects.length - 1; i >= 0; i--) {
			var item=$(multiSelects[i]); 
			initChangeEvent(item); 
		}
	};

	/*
	初始化Change事件
	*/
	var initChangeEvent=function(item){ 
		if(!item){
			return;
		}
		var data=item.data();

 		if(!data.targetChildren){
			return;
		}

		item.on("change",function(){ 
			$(data.targetChildren).triggerHandler("init");
		});
 
		initChildrenEvent($(data.targetChildren));
	};

	/**
	init 事件
	*/
	var initChildrenEvent=function(item){
		if(!item){
			return;
		}

		initChangeEvent(item);

		item.bind("init",function(){
			var that=$(this);
			var data=that.data();
			that.html($("<option value='0'>请选择</option>"));

			//初始化数据
			initData(that,data);

			if(!data.targetChildren){
				return;
			} 

			var children=$(data.targetChildren);
			if(!children){
				console.log(" can not find the children element id="+data.targetChildren);
				return;
			}

			children.triggerHandler("init");
		});
	};

	/*
	绑定数据
	*/
	var initData=function(item,itemData){
		if(!itemData.targetParent){ 
			return;
		}

		var parent=$(itemData.targetParent);
		 
		var pid = parent.val();
		if (!pid || pid === undefined || pid === "undefined" || pid <= 0 || pid==="请选择") {
			return;
		}

		if(!itemData.jurl){
			 console.log("form post url  is not find ");
			return;
		}
		item.attr("disabled", true);
		var paramName;
		if (!itemData.targetParameterName || itemData.targetParameterName === "") {
		    paramName = "pid";
		} else {
		    paramName = itemData.targetParameterName;
		}
		var url = itemData.jurl + "?" + paramName + "=" + pid;
		 
		//发送请求 
		Tools.post(url,{},function(data){
			if (data && data.ErrorCode && data.ErrorCode != "Success"){
				console.log(data.Msg);
				item.attr("disabled", false);
				return;
			}
			var json=data.Value;

			//绑定到页面
			for (var i = json.length - 1; i >= 0; i--) {
				var itemdata=json[i];
				item.append($(Tools.analysisTemplateHtml(optionTemplate,itemdata)));	
			}
		    //控件状态 已完成
			item.attr("disabled", false);
		});
	   
	     
	};
     
    return {
        init: function () {
    		$(function(){
    			parseControl();
    		});
    	}
    };
}();

MultiSelect.init();

