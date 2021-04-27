# ESA for uniapp

## 主要结构

esa/ 框架目录
static/config.json 配置文件

## 用法

### 添加

1. 将esa/目录复制放置项目目录的根目录
2. 创建或复制static/config.json文件至项目的static/文件夹中

### 引用

main.js文件中添加如下代码引入
```
import esa from 'esa/common.js'
Vue.prototype.esa = esa
```

### 使用

在文件中使用
```
this.esa.test();
```


