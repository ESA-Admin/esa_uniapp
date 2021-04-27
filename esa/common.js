import config from '@/static/config.json'

var esa = {
	test:function(){
		console.log(config)
	},
	url:function(action){
		if(action.indexOf("/") === 0){
			return config.url+action+".html?PLATFORM_ID="+config.pfid;
		}else if(action.indexOf("http://") === 0 || action.indexOf("https://") === 0){
			return action;
		}
		var url = config.url+"/addons/"+config.pfid+"/"+config.addon+"."+action+".html";
		return url;
	},
	request:function(options,success,error){
		options = typeof options === "string" ? {url:options} : options;
		options.url = esa.url(options.url);
		var index;
		if(typeof options.loading === "undefined" || options.loading){
			uni.showLoading({title:'加载中'})
		}
		const param = Object.assign({
			type		: "POST",
			dataType	: "json",
			success		: function(res){
				uni.hideLoading();
				res = res.data;
				// console.log(res);
				try{
					res = typeof res === "object" ? res : JSON.parse(res);
					if(typeof res !== "object") success.call(this,res,res);
				}catch(e){
					res = {code:99999,msg:"ajax请求错误",data:[]}
				}
				var data = typeof res.data !== "undefined" ? res.data : null;
				var msg = typeof res.msg !== "undefined" && res.msg ? res.msg : "";
				if (res.code === 0) {
					if (typeof success === 'function') {
						var result = success.call(this, data, res);
						if (result === false)
							return;
					}
					if(msg !== ""){
						uni.showToast({
							'title':msg
						})
					}
				} else {
					if (typeof error === 'function') {
						var result = error.call(this, data, res);
						if (result === false)
							return;
					}
					if(msg !== ""){
						uni.showToast({
							'title'	: msg,
							'icon'	: "none"
						})
					}
				}
			},
			fail		: function(error){
				console.log(error)
				uni.hideLoading();
			}
		},options);
		param.header = typeof param.header === "undefined" ? {'token':uni.getStorageSync("__TOKEN__")} : Object.assign({'token':uni.getStorageSync("__TOKEN__")},param.header);
		return uni.request(param);
	},
	checkToken:function(success,error){
		console.log("校验TOKEN")
		esa.request({
			url		: "/api/wxapp/checkToken",
			method	: "POST",
			loading	: false,
		},function(d){
			success.call(d);
			return false;
		},function(e){
			error.call(e);
			return false;
		})
	},
	getEsaUser:function(callback,code){
		console.log("微信小程序：根据code获取用户openid")
		esa.request({
			url		: "/api/wxapp/code2user",
			data	: {code:code},
			loading	: false,
		},function(d){
			console.log(d);
			uni.setStorageSync('__TOKEN__', d.token);
			uni.setStorageSync('ESA_USER',d);
			callback.call(d);
			return false;
		})
	},
	upgradeUser:function(wxappUserInfo,callback){
		var userInfo = uni.getStorageSync("ESA_USER");
		console.log(userInfo);
		if(!wxappUserInfo){
			return typeof callback == "function" && callback.call(this,userInfo);
		}
		userInfo.wxappUserInfo = wxappUserInfo.userInfo;
		esa.request({
			url		: "/api/wxapp/upgradeUser",
			method	: "POST",
			data	: userInfo,
		},function(d){
			uni.setStorageSync("ESA_USER",d);
			typeof callback == "function" && callback.call(this,d);
		})
	},
	login:function(callback,wxappUserInfo){
		console.log("开始登陆");
		uni.login({
			success:function(res){
				console.log("微信登陆开始！",res)
				esa.getEsaUser(function(userInfo){
					console.log("获取ESA会员成功");
					if(wxappUserInfo){
						esa.upgradeUser(wxappUserInfo,function(userInfo){
							callback.call(userInfo)
						})
					}else{
						uni.authorize({
							scope:"scope.userProfile",
							success:function(){
								console.log("授权检测成功");
								uni.showModal({
									title	: "登陆",
									content	: "请允许授权来提供相关服务",
									showCancel	: false,
									success	:function(){
										uni.getUserProfile({
											desc:"登陆",
											lang:"zh",
											success:function(res){
												console.log("用户信息授权成功")
												uni.setStorageSync("wxappUserInfo",res.userInfo);
												esa.upgradeUser(res,function(userInfo){
													typeof callback == "function" && callback.call(this,userInfo);
												})
											},
											fail:function(err){
												console.log("用户信息授权失败")
												typeof callback == "function" && callback.call(this,userInfo);
											}
										})
									}
								})
							},
							fail:function(){
								console.log("自动读取授权失败,开始弹出授权处理");
								uni.showModal({
									title	: "登陆",
									content	: "请允许授权来提供相关服务",
									showCancel	: false,
									success	:function(){
										uni.getUserProfile({
											desc:"登陆",
											lang:"zh",
											success:function(res){
												console.log("用户信息授权成功",res)
												esa.upgradeUser(res,function(userInfo){
													typeof callback == "function" && callback.call(this,userInfo);
												})
											},
											fail:function(err){
												console.log("用户信息授权失败",err)
												typeof callback == "function" && callback.call(this,userInfo);
											}
										})
									}
								})
							}
						})
					}
				},res.code);
			}
		})
	},
	getUserInfo:function(callback,wxappUserInfo){
		var token = uni.getStorageSync("__TOKEN__");
		console.log("获取用户信息！");
		if(!token){
			// 用户信息不存在，登陆
			console.log("Token不存在");
			esa.login();
		}else{
			console.log("Token存在");
			
			esa.checkToken(function(){
				if(wxappUserInfo){
					esa.updateUser(wxappUserInfo,function(userInfo){
						if(typeof callback === "function") callback.call(this,userInfo);
					});
				}else{
					if(typeof callback === "function") callback.call(this,userInfo);
				}
			},function(){
				esa.login();
			})
		}
	}
}

module.exports = esa;
