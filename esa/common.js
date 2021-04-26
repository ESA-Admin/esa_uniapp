import config from '@/static/config.json'

var esa = {
	test:function(){
		console.log(config)
	},
	url:function(action){
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
				console.log(res);
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
		return uni.request(param);
	},
	getEsaUser:function(callback,code){
		console.log("微信小程序：根据code获取用户openid")
		callback.call(code)
	},
	login:function(callback,wxappInfo){
		console.log("开始登陆");
		uni.login({
			success:function(res){
				console.log("微信登陆开始！",res)
				esa.getEsaUser(function(userInfo){
					console.log("获取ESA会员成功");
					if(wxappInfo){
						esa.upgradeUser(wxappInfo,function(userInfo){
							callback.call(userInfo)
						})
					}else{
						uni.authorize({
							scope:"scope.userInfo",
							success:function(){
								console.log("授权检测成功");
							},
							fail:function(){
								console.log("自动读取授权失败,开始弹出授权处理");
								uni.getUserProfile({
									desc:"登陆",
									lang:"zh",
									success:function(res){
										console.log("用户信息授权成功",res)
									},
									fail:function(err){
										console.log("用户信息授权失败",err)
									}
								})
							}
						})
					}
				},res.code);
			}
		})
	},
	getUserInfo:function(callback,wxappInfo){
		var token = uni.getStorageSync("__TOKEN__");
		console.log("获取用户信息！");
		if(!token){
			// 用户信息不存在，登陆
			console.log("Token不存在");
			esa.login();
		}else{
			console.log("Token存在");
			esa.checkToken(function(){
				if(wxappInfo){
					esa.updateUser(wxappInfo,function(userInfo){
						callback.call(this,userInfo);
					});
				}else{
					callback.call(this,userInfo);
				}
			},function(){
				esa.login();
			})
		}
	}
}

module.exports = esa;
