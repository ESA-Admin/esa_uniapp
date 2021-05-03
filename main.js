import Vue from 'vue'
import App from './App'

import store from './store'
Vue.prototype.$store = store

import esa from 'esa/common.js'
Vue.prototype.esa = esa

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
