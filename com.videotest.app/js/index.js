$(function() {

	var deviceNo = localStorage.getItem("deviceNo");
	var host = localStorage.getItem("host");
	var wsHost = "ws" + host.slice(4);
	console.log("deviceNo+" + deviceNo);
	console.log("host+" + host);
	console.log("wsHost+" + wsHost);
	if(deviceNo == "" || host == "") {
		window.location.href = "page/login.html";
		return;
	}

	//      获取图片链接
	getImgUrl()
	var baseImagePath;

	function getImgUrl() {
		$.ajax({
			type: "GET",
			url: host + "/api/imgserver",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(result) {
				baseImagePath = result.object;
				console.log("baseImagePath+" + baseImagePath);
				getUrlImg()
			},
			error: function(msg) {
				console.log(msg)
			}
		});
	};

	//      显示广告
	function getUrlImg() {
		if(baseImagePath) {
			showAds(0);
		} else {
			getImgUrl();
			setTimeout(function() {
				showAds(0);
			}, 3000)
		}
	}

	function showAds(time) {
		console.log("showAds")
		if(time < 1) {
			connectWs(wsHost + "/websocket/ssib/ad?deviceNo=" + deviceNo);
			showModle()
		} else {
			var timer = setTimeout(function() {
				showModle();
				clearTimeout(timer);
			}, time);
		}
	}

	function connectWs(target) {
		$.ajax({
			type: "GET",
			url: host + "/api/ssib/advert/ws/" + deviceNo,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(result) {
				console.log(JSON.stringify(result))
				alert(JSON.stringify(result))
//				if(result.success == true) {
				if(result.code == 0) {
					console.log(target);
					var ws = new ReconnectingWebSocket(target);

					ws.onopen = function(e) {
						console.log("............." + JSON.stringify(e))
						toast("连接服务器成功");
					};
					ws.onerror = function(e) {
						console.log(JSON.stringify(e))
						toast("服务器连接出错");
					};

					//连接关闭的回调方法
					ws.onclose = function(e) {
						toast("服务器连接关闭");
						console.log(JSON.stringify(e))
						if(e.code === 1003) {
							self.readyState = WebSocket.CLOSED;
							eventTarget.dispatchEvent(generateEvent('close'));
							alert(e.reason);
							return;
						}
					};

					ws.onmessage = function(event) {
						var result = JSON.parse(event.data);
						console.log(result);
						var type = result.type;
						if(result.success === false) {
							openFail(result.msg);
						} else if(type === "door") {
							var success = result.success;
							var msg = result.msg;
							if(success === true) {
								openSuccess(msg);
							} else {
								openFail(msg);
							}
						} else if(type === "opening") {
							opening();
						} else if(type === "update") {
							var data = result.data;
							var amount = data.amount;
							var list = data.list;
							updateList(list, amount);
						} else if(type === "final") {
							var data = result.data;
							var amount = data.amount;
							var list = data.list;
							updateList(list, amount);
							if(list.length == 0) {
								intHtml();
							} else {
								var timer = setTimeout(function() {
									intHtml();
									clearTimeout(timer);
								}, 3000)
							}
						} else if(type === "ad") {
							getAds(result);
							intHtml();
							showModle();
						}
					}
					//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
					window.onbeforeunload = function() {
						toast("窗口关闭")
						ws.close();
					}
				} else {
					alert(result.msg);
					localStorage.removeItem("deviceNo");
					window.location.href = './page/login.html';
				}
			},
			error: function(msg) {
				console.log(msg)
			}
		});
	}

	//             // toast

	function toast(msg) {
		$('.toast').html(msg);
		$('.toast').fadeIn();
		setTimeout(function() {
			$('.toast').fadeOut("slow");
			$('.toast').html("");
		}, 3000)
	}

	// 显示列表
	function updateList(list, amount, type) {

		showList();

		if(list.length < 1) {
			$(".literals").text("请选择商品").show();
		} else {
			$(".literals").text("").hide();
			if(type == "update") {
				var html = "";
			} else if(type == "final") {
				var html = '<div class="top1"><p>提示：若出现故障致出货失败，系统将在审核后自动退款</p><img th:src="@{/ssib/image/shoppingCart.png}" src="../../static/ssib/image/shoppingCart.png" alt=""></div>';
			}

			for(var i = 0; i < list.length; i++) {
				var goods = list[i];
				html += '<div class="parameter">';
				html += '<div class="picture">';
				html += '<img src="' + baseImagePath + goods.thumbImage + '" >';
				html += '</div>';
				html += '<div>';
				html += '<div class="toubuwz">' + goods.name + '</div>';
				html += '<div>';
				html += '<span>商品:' + goods.name + '</span>';
				if(goods.isBulk !== 1) {
					html += '<span>数量:' + goods.quantity + '</span>';
					html += '<span>单价:' + goods.price + '</span>';
				} else {
					html += '<span>重量:' + goods.quantity + ' ' + goods.quantityUnit + '</span>';
					html += '<span>单价:' + goods.price + ' ' + goods.priceUnit + '</span>';
				}
				html += '</div>';
				html += '<div>合计:' + goods.amount + '</div>';
				html += '</div>';
				html += '</div>';
			}
		}
		html += '<div class="total">';
		html += '<p><span>合计:</span>';
		html += '<span>' + amount + '</span></p>';
		html += '</div>';
		
		$(".form").html(html);
	}

	// //        正在开门
	function opening() {
		$(".top").hide();
		$(".content .form").hide();
		$('.imgStates').attr("src", "img/opening.png").show();
		$(".literals").text("正在开门。。。").show();
		$("body").removeClass("bgcImp");
	}

	// //        开门失败
	function openFail(msg) {
		$(".top").hide();
		$(".content .form").hide();
		$('.imgStates').attr("src", "img/open-fail.gif").show();
		$(".literals").text(msg).show();
		$("body").removeClass("bgcImp");
	}

	// //        开门成功
	function openSuccess(msg) {
		$(".top").hide();
		$(".content .form").hide();
		$(".literals").text(msg).show();
		$('.imgStates').attr("src", "img/success.png").show();
		$("body").removeClass("bgcImp");
	}

	// //        未购买任何商品
	function noChose() {
		$(".top").hide();
		$(".content .form").hide();
		$('.imgStates').hide();
		$(".literals").text("您未购买任何商品").show();
		$("body").removeClass("bgcImp");
	}

	// //        显示列表
	function showList() {
		$(".top").hide();
		$(".content .form").show();
		$('.imgStates').hide();
		$(".literals").hide();
		$("body").addClass("bgcImp");
	}
	// 初始显示
	function intHtml() {
		$(".top").hide();
		$(".content .form").hide();
		$('.imgStates').attr("src", "img/opening.png").show();
		$(".literals").text("欢迎光临").show();
		$("body").removeClass("bgcImp");
	}

	//              一段时间后自动请求
	//     setInterval(function () {
	//             ws.send("update");
	//        }, 60000);
	//
	//        隐藏广告
	function showPro() {
		$(".adsBox").hide();
	}

	//       显示广告
	function showModle() {
		$(".adsBox").show();
	}

	//      拼接广告

	function getAds(data) {
		console.log(data);
		var list = data.data.linkUrl;
		var html = "";

		if(data.data.type == "1") {
			if(list) {
				html = '<div style="width: 100%;height:100%;"><video id="my-video" style="width: 100%; height:100%; background: rgba(100,0,0,0.9); object-fit:fill;"  autoplay="autoplay" preload="none" ><source src="' + baseImagePath + list + '" type="video/mp4"><p class="vjs-no-js"></p></video></div>';
			} else {
				html = '<div style="width: 100%;height:100%;"><video id="my-video" style="width: 100%; height:100%; background: rgba(100,0,0,0.9); object-fit:fill;"  autoplay="autoplay" preload="none" ><source src="img/movie1.mp4" type="video/mp4"><p class="vjs-no-js"></p></video></div>';
			}

		} else {
			for(var i = 0; i < list.length; i++) {
				var item = list[i];
				if(item.type == 0) {
					var urllist = item.linkUrl.split(",");
					for(var j = 0; j < urllist.length; j++) {
						html += '<div class="swiper-slide"><img src="' + baseImagePath + urllist[j] + '" ></div>';
					}
				}
			}
		}

		$(".swiper-wrapper").html(html);
		if(!($(".swiper-wrapper").html())) {
			$(".swiper-wrapper").html('<div style="width: 100%;height:100%;"><video id="my-video" style="width: 100%; height:100%; background: rgba(100,0,0,0.9); object-fit:fill;"  autoplay="autoplay" preload="none" ><source src="img/movie1.mp4" type="video/mp4"><p class="vjs-no-js"></p></video></div>');
		}
		var myPlayer = videojs('my-video');
		videojs("my-video").ready(function() {
			var myPlayer = this;
			myPlayer.play();
			myPlayer.on("ended", function() {
				myPlayer.play();
				var timer = this.currentTime() * 1000;
				console.log(timer);
				var time1 = setInterval(function() {
					myPlayer.play();
					clearInterval(time1);
				}, timer)
			});
		});
		var swiper = new Swiper('.swiper-container', {
			pagination: '.swiper-pagination',
			paginationClickable: true,
			autoplay: 3000,
			autoplayDisableOnInteraction: false,
			nextButton: '.swiper-button-next',
			prevButton: '.swiper-button-prev',
			loop: true,
			speed: 500,
		})
	}
});