<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area title" v-if="login">
			{{userInfo.nickname ? userInfo.nickname : ''}}
		</view>
		<view class="text-area" v-if="!login">
			<button @tap="toLogin">登陆</button>
		</view>
			<!-- <text class="title">{{userInfo.nickName}}</text>
			<text class="title">{{title2}}</text>
			<button @tap="login" v-if="!userInfo">登陆</button> -->
		
	</view>
</template>

<script>
	export default {
		computed:{
			userInfo(){
				return this.$store.state.userInfo
			},
			login(){
				return this.$store.state.login
			}
		},
		data() {
			return {
				title: 'Hello',
				title2: 'default',
				// userInfo: false,
			}
		},
		onLoad() {
			var that = this;
			console.log(that.$store);
			this.esa.request({
				url:"api.index/index",
				loading:false
			},function(data,res,userInfo){
				// console.log(res)
				that.title = res.msg
				return false;
			})
			this.esa.request({
				url:"api.index/index2",
				loading:false
			},(data,res, userInfo)=>{
				this.title2 = res.msg
				if(userInfo){
					console.log(userInfo)
					this.$store.commit("setUserInfo",userInfo);
				}
				return false;
			})
		},
		methods: {
			toLogin:function(){
				this.esa.login((userInfo)=>{
					console.log("获取用户信息回调！",userInfo);
					this.$store.commit("setUserInfo",userInfo);
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
