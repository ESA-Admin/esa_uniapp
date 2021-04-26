import config from '@/static/config.json'

var esa = {
	// 测试
	test:function(){
		config.log(config);
	},
	// 请求
	request:function(){
		console.log(config)
	}
}

module.exports = esa;