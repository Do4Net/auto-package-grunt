# auto-package-grunt
采用 grunt 自动 代码合并concat（代码合并依赖关系） ，检查jshint（匹配工具代码自动忽略） ，压缩uglify</br>

1 . 根据配置的js源代码路径（详情查看package 中jspath）按照模块（模块按照文件夹区分 一个模块中有一个入口index.js文件，其他工具类库自动合并到当前入口文件中，工具类命名规则查阅下一条 ，类库依赖顺序 按照文件排序优先级）自动合并当前模块下的js文件到入口文件中</br>
2 . 工具类规则：文件名中包含 .tools 字段 在检测js语法的时候自动过滤</br>
3 . grunt 自动合并、检查、压缩的入口按照package中jspath自动装载文件</br>
4 . 压缩依赖package中配置的environment（product、dev）进行选择 product版本进行代码合并、检查、压缩，dev环境 只进行代码合并，检查</br>
5 . 命令组合查看package 中script</br>
