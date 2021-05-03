import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);//vue的插件机制

//Vuex.Store 构造器选项
const store = new Vuex.Store({
    state:{
        "userInfo"	: false,
        "login"		: false
    },
	mutations:{
		setUserInfo(state,d){
			state.userInfo = d;
			state.login = d.login;
		}
	}
})
export default store