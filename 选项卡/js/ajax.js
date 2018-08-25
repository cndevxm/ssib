var common = {    
    service: {
        commonService: function (url, data, callback) {
            jQuery.post(host+url,data,function (result) {
                if(result.success==true){
                    callback(result.object);
                }else if(600==result.code){
                	
                }else{
                    common.tip.message(result.msg)
                }
            });
        },
        baseService: function (url, data, callback) {
            var opt = {
                url: host+url,
                data: {body:data,header:{}},
                callback: function (result) {
                    if (result.success==true) {
                        if (callback) {
                            callback(result.object);
                        }
                    } else {
                        common.tip.alert(result.msg);
                    }
                }
            };
            common.ajax.post()
        },
        pageService: function (url, data,page, callback) {
            var opt = {
                url: host+url,
                data: {body:data,header:{},page:page},
                callback: function (result) {
                    if (result.success==true) {
                        if (callback) {
                            callback(result.object);
                        }
                    } else {
                        common.tip.alert(result.msg);
                    }
                }
            };
            common.ajax.post(opt)
        }
    },
    ajax: {
        post: function (opt) {
            opt.data = opt.data || {};
            console.log("data:" + JSON.stringify(opt.data));
            jQuery.ajax({
                type: 'post',
                url: opt.url,
                dataType: 'json',
                data: JSON.stringify(opt.data),
                contentType: 'application/json',
                success: function (result) {
                    console.log(opt.url);
                    console.log(result);
                    if (opt.callback) {
                        opt.callback(result);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                }
            });
        }
    },
     tip: {
        alert: function (msg, callback) {
            alert(msg);
            if(callback){
                callback();
            }
        },
        message: function (msg, callback) {
            alert(msg);
            if (callback) {
                callback();
            }
        },
        confirm: function (message, ok, cancel) {
            if(confirm(message)){
                if (ok) {
                    ok();
                }
            }else{
                if (cancel) {
                    cancel();
                }
            }
        }
    }
};