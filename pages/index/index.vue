<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area title">
			{{userInfo.nickname ? userInfo.nickname : ''}}
		</view>
		<view class="text-area" v-if="!userInfo">
			<button @tap="login">登陆</button>
		</view>
			<!-- <text class="title">{{userInfo.nickName}}</text>
			<text class="title">{{title2}}</text>
			<button @tap="login" v-if="!userInfo">登陆</button> -->
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				title2: 'default',
				userInfo: uni.getStorageSync("ESA_USER")
			}
		},
		onLoad() {
			var that = this;
			this.esa.request({
				url:"api.index/index",
				loading:false
			},function(data,res){
				// console.log(res)
				that.title = res.msg
				return false;
			})
			this.esa.request({
				url:"api.index/index2",
				loading:false
			},(data,res)=>{
				this.title2 = res.msg
				return false;
			})
			console.log(this.userInfo);
		},
		methods: {
			login:function(){
				this.esa.getUserInfo((userInfo)=>{
					console.log("获取用户信息回调！",userInfo);
					this.userInfo = userInfo;
				});
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
