import config from '@/static/config.json'
// import store from '@/store/test.js'

var esa = {
	loginStatus:false,
	userInfo:false,
	wxappUserInfo:false,
	url:function(action){
		if(action.indexOf("/") === 0){
			return config.url+action+".html?PLATFORM_ID="+config.pfid;
		}else if(action.indexOf("http://") === 0 || action.indexOf("https://") === 0){
			return action;
		}
		var url = config.url+"/addons/"+config.pfid+"/"+config.addon+"."+action+".html?from=wxapp";
		return url;
	},
	request:function(options,success,error,status,userInfo){
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
				if (res.code === 101001){
					// 需要登录
					if(status){
						console.log("重复登录，检查系统代码问题！");
						return ;
					}
					esa.user_login((userInfo)=>{
						console.log("二次登录");
						if(userInfo){
							esa.request(options,success,error,true,userInfo)
						}else{
							console.log("登录失败");
						}
					});
					// esa.login(function(){},uni.getStorageSync("wxappUserInfo"));
				} else if (res.code === 0) {
					if (typeof success === 'function') {
						var result = success.call(this, data, res, userInfo);
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
			success.call(this,d);
			return false;
		},function(e){
			error.call(this,e);
			return false;
		})
	},
	getEsaUser:function(callback,code){
		console.log("微信小程序：根据code获取用户openid")
		var that = this;
		esa.request({
			url		: "/api/wxapp/code2user",
			data	: {code:code},
			loading	: false,
		},function(d){
			console.log("code2user获取用户信息结果",d);
			uni.setStorageSync('__TOKEN__', d.token);
			uni.setStorageSync('ESA_LOGIN',d.login);
			uni.setStorageSync('ESA_USER',d);
			esa._token = d.token;
			esa.loginStatus = true;
			esa.userInfo = d;
			callback.call(this,d);
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
			uni.setStorageSync("ESA_LOGIN",true);
			uni.setStorageSync("ESA_USER",d);
			esa.loginStatus = true;
			esa.userInfo = d;
			typeof callback == "function" && callback.call(this,d);
			return false;
		})
	},
	
	user_login:function(callback){
		// 如果需要账号密码是跳转至登录页
		// 如果是微信小程序直接用code登录
		uni.login({
			success:function(res){
				console.log("开始登录");
				esa.getEsaUser(function(userInfo){
					typeof callback == "function" && callback.call(this,userInfo);
				},res.code);
			},
			fail:function(err){
				cosnole.log(err)
			}
		})
	},
	login:function(callback,status=0){
		console.log("微信登陆开始！")
		if(status>=3){
			console.log("重复登录处理，禁止死循环，代码、接口检查错误！");
		}
		esa.checkToken(function(res){
			uni.showModal({
				title	: "授权",
				content	: "请允许授权以提供相关服务。",
				showCancel	: true,
				success	:function(param){
					if(param.confirm){
						uni.getUserProfile({
							desc:"登陆",
							lang:"zh",
							success:function(res){
								console.log("用户信息授权成功")
								uni.setStorageSync("wxappUserInfo",res.userInfo);
								esa.wxappUserInfo = res.userInfo;
								esa.upgradeUser(res,function(userInfo){
									typeof callback == "function" && callback.call(this,userInfo);
								})
							},
							fail:function(err){
								console.log("用户信息授权失败")
								if(secound){
									typeof callback == "function" && callback.call(this,userInfo);
								}else{
									esa.login(callback,wxappUserInfo,true)
								}
								
							}
						})
					}
					if(param.cancel){
						// 点击取消，未授权用户信息
						uni.setStorageSync("wxappUserInfo",false)
						esa.wxappUserInfo = false;
						typeof callback == "function" && callback.call(this,userInfo);
					}
				}
			})
		},function(err){
			console.log("Token 校验失败",err);
			esa.user_login(function(userInfo){
				esa.login(callback);
			},status++)
		})
		
	},
	getUserInfo:function(callback){
		uni.getStorage({
		    key: 'ESA_USER',
		    success: function (res) {
		        console.log("获取缓存中的用户信息：",res.data);
				if(res.data && res.data.login){
					callback.call(this,res.data);
				}else{
					callback.call(this,false);
				}
		    }
		});
	}
}

module.exports = esa;
