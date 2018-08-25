
//js时间格式化;
Date.prototype.format = function(format) {
    var o = {
        "M+" : this.getMonth() + 1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S"  : this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for ( var k in o) if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]: ("00" + o[k]).substr(("" + o[k]).length));
    }
    return format;
};

var common={
    post:function (option) {
        $.post(option.url,option.data,function (result) {
            if(result.code==0){
                if(option.success){
                    option.success(result);
                }
            }else if(600==result.code){
                xxl.message("登录失效",2);
                setTimeout(function () {
                    top.location.href="/b";
                },1000);
            }else{
                xxl.message(result.message,2);
            }
        });
    },
    getProvince:function () {
        common.post({url:"/b/area/getArea",data:{},success:function (result) {
            var cityList = result.data;
            if(cityList){
                var value = $("#provinceSelector").data("value");
                $("#provinceSelector").html('<option value="">请选择</option>');
                for(var i=0;i<cityList.length;i++){
                    var city = cityList[i];
                    if(value==city.code){
                        $("#provinceSelector").append('<option selected value="'+city.code+'">'+city.name+'</option>');
                    }else{
                        $("#provinceSelector").append('<option value="'+city.code+'">'+city.name+'</option>');

                    }
                }
                if(value){
                    common.getCity();
                }
            }
        }});
    },
    getCity:function(){
        var code = $("#provinceSelector").val();
        if(!code){
            if($("#citySelector")[0]){
                $("#citySelector").html("");
            }
            console.log(123);
            if($("#districtSelector")[0]){
                $("#districtSelector").html("");
            }
            return;
        }
        common.post({url:"/b/area/getArea",data:{code:code},success:function (result) {
            var cityList = result.data;
            if(cityList){
                var value = $("#citySelector").data("value");
                $("#citySelector").html('<option value="">请选择</option>');
                for(var i=0;i<cityList.length;i++){
                    var city = cityList[i];
                    if(value==city.code){
                        $("#citySelector").append('<option selected value="'+city.code+'">'+city.name+'</option>');
                    }else{
                        $("#citySelector").append('<option value="'+city.code+'">'+city.name+'</option>');

                    }
                }
                if(value){
                    common.getDistrict();
                }
            }
        }});
    },
    getDistrict:function(){
        var code = $("#citySelector").val();
        if(!code){
            if($("#districtSelector")[0]){
                $("#districtSelector").html("");
            }
            return;
        }
        common.post({url:"/b/area/getArea",data:{code:code},success:function (result) {
            var cityList = result.data;
            if(cityList){
                var value = $("#districtSelector").data("value");
                $("#districtSelector").html('<option value="">请选择</option>');
                for(var i=0;i<cityList.length;i++){
                    var city = cityList[i];
                    if(value==city.code){
                        $("#districtSelector").append('<option selected value="'+city.code+'">'+city.name+'</option>');
                    }else{
                        $("#districtSelector").append('<option value="'+city.code+'">'+city.name+'</option>');

                    }
                }
            }
        }});
    },

    getOrganization:function () {
        console.log("getOrganization");
        common.post({url:"/b/organization/getOrganization",data:{},success:function (result) {
            var cityList = result.data;
            if(cityList){
                var value = $("#organizationId").data("value");
                $("#organizationId").html('<option value="">请选择</option>');
                for(var i=0;i<cityList.length;i++){
                    var city = cityList[i];
                    if(value==city.id){
                        $("#organizationId").append('<option selected value="'+city.id+'">'+city.title+'</option>');
                    }else{
                        $("#organizationId").append('<option value="'+city.id+'">'+city.title+'</option>');
                    }
                }
                if(value){
                    common.getCategory();
                }
            }
        }});
    },

    getCategory:function(){
        var code = $("#organizationId").val();
        if(!code){
            if($("#organizationId")[0]){
                $("#organizationId").html("");
            }
            return;
        }
        common.post({url:"/b/goodsType/getCategories",data:{organizationId:code},success:function (result) {
            var cityList = result.data;
            if(cityList){
                var value = $("#category").data("value");
                console.log("category="+value);
                $("#category").html('<option value="">请选择</option>');
                for(var i=0;i<cityList.length;i++){
                    var city = cityList[i];
                    console.log("code="+city.code);
                    if(value==city.code){
                        $("#category").append('<option selected value="'+city.code+'">'+city.name+'</option>');
                    }else{
                        $("#category").append('<option value="'+city.code+'">'+city.name+'</option>');
                    }
                }
            }
        }});
    }





};
$(function () {
    $("#provinceSelector").each(function () {
        common.getProvince();
    });
    $("#organizationId").each(function () {
        common.getOrganization();
    });
})
var dialogGrid = {
    init:function (option) {
        var id = "dialog_grid_"+option.key;
        var gridId = "grid_"+option.key;
        var $this =  $("#"+id);
        var target = $("#"+option.key);
        target.click(function () {
            $("#"+id).show();
        });
        target.keyup(function () {
            var value = $(this).val();
            var params = option.searchName+"="+value;
            if(option.otherSearchParams){
                if(typeof(eval(option.otherSearchParams)) === "function") {
                    var otherSearchParams = eval(option.otherSearchParams+"();");
                    params = otherSearchParams +"&"+params;
                }else {
                    params = option.otherSearchParams()+"&"+params;
                }
            }
            console.log(params);
            $.fn.bsgrid.getGridObj("grid_"+option.key).search(params);
        });
        var header = option.header;
        //初始化html
        var html = '<div class="mt-10 dialog-grid" id="'+id+'"><table id="'+gridId+'" class="bs-grid"><tr></tr></table></div>';
        var htmlObj = $(html);
        for(var i = 0;i<header.length;i++){
            var optionItem = header[i];
            htmlObj.find("tr").append('<th w_index="'+optionItem.index+'" w_align="center" width="'+(100/header.length)+'%;">'+optionItem.title+'</th>');
        }
        target.after(htmlObj.get(0).outerHTML);
        var gridObj = BSGrid.init(gridId, {
            url:option.url,
            event:{
                selectRowEvent:function (rowData,row, trObj, options) {
                    target.val(rowData.productNo);
                    $(".dialog-grid").hide();
                    option.onSelected(rowData,row, trObj, options);
                }
            },
            otherParames: option.otherSearchParams?option.otherSearchParams():"",
            additionalAfterRenderGrid:function (parseSuccess, gridData, options) {
                $("#"+gridId+"_pt_outTab").hide();
                $("#"+gridId).css("min-width","inherit");
                console.log($("#"+gridId).css("min-width"))
            }
        });
        $("body").click(function (e) {
            if($(e.toElement).parents("#"+id).size()>0 || e.toElement.id == option.key){
            }else{
                $("#"+id).hide();
            }
        });
    }
};