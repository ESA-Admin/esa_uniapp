import Vue from 'vue'
import App from './App'
import esa from 'esa/common.js'
Vue.prototype.esa = esa

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
