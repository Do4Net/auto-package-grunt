var  path =require('path');
var fs=require("fs"); 

module.exports = function(grunt) {

var packageinfo=grunt.file.readJSON('package.json');
grunt.initConfig({
  pkg:packageinfo,
   uglify: {
    options: {
      banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd hh:mm:ss:ff") %> * /\n'
    },
    build:{
       files:getMinModuleEntry(packageinfo.jspath.commondesc)
    }
  },
  concat: {
    dist: {
      options: { 
        banner: "'use strict';\n",
        process: function(src, filepath) {
          return '// Source: ' + filepath + '\n' +
            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
        }
      },
      files: getModuleEntry(packageinfo.jspath.commonsrc)
    }
  },
  jshint:{
    build:getJshintModuleEntry(packageinfo.jspath.commondesc),
    options:{
      eqnull:true,
      eqeqeq:false,//设置为true,禁止使用这个选项 ==和 !=，强制使用 ===和 !==。
      boss:true,//禁止比较表达式的值没有达到预期警告
      curly:true,//循环或者条件语句必须使用花括号包围.
      quotmark:false,  
      devel: true, //这个选项定义了全局变量,通常用于日志调试: console, alert等等
      node: true,//这个选项定义全局变量可以当你的代码运行在node的运行时环境
      loopfunc:true,//禁止内部循环
      validthis:true,//在非构造器函数中使用 this
      browser:true,//暴露浏览器属性的全局变量，列如 window,document;
      lastsemic:true,//检查一行代码最后声明后面的分号是否遗漏
      shadow:false,// 只检查是否在相同的作用域重复定义
      funcscope:true,//禁止从外部访问内部声明的变量
      esversion:6,//3--如果你需要可执行程序在老这类浏览器Internet Explorer 6/7/8/9-and其他遗留JavaScript环境
                  //5--先使语法中定义ECMAScript 5.1规范。这包括允许保留关键字作为对象属性。
                  //6--告诉JSHint代码使用ECMAScript 6具体的语法。请注意,并不是所有的浏览器都实现它们。
      globals: {//这个选项可以用来指定一个没有正式定义的全局变量的白名单
                $: false,
                jQuery: true,
                Tools:false
            }
    }
  }
});
  
  //加载concat配置
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('concatjs',['concat']);
  //加载代码检查
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('validatejs',['jshint']);
  //加载代码压缩
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('uglifyjs', ['uglify']);
  //命令组合
  //grunt.registerTask('compressjs',['concat','jshint']);
  if(packageinfo.environment=="product"){
      grunt.registerTask('compressjs',['concat','jshint','uglify']);//,'jshint',
  }else if(packageinfo.environment=="dev"){
      grunt.registerTask('compressjs',['concat','jshint']);
  }
   
  // Default
  grunt.registerTask('default', []);

  
  function getJshintModuleEntry(srcDir){
  var files=[];
  var getFiles=function(srcDir,files){
    var dirs = fs.readdirSync(srcDir);

    dirs.forEach(function (item) { 
        var temp;
        var matchs = [];
        matchs = item.match(/^.*?.js$/); 
        temp=path.resolve(srcDir, item); 
        if (matchs&&temp.indexOf(".tools")<0) {
          files.push(temp); 
        }else{
          var stat = fs.statSync(path.resolve(srcDir,item));
          if(stat.isDirectory()){
            getFiles(path.resolve(srcDir,item),files);
          }
        } 
    });
  }

  getFiles(srcDir,files); 
  return files;
};

  function getModuleEntry(srcDir){
  var files={};
  var getFiles=function(srcDir,files){
    var dirs = fs.readdirSync(srcDir);

    dirs.forEach(function (item) { 
        var temp;
        var matchs = [];
        matchs = item.match(/^.*?.js$/); 
        temp=path.resolve(srcDir, item); 
        if (matchs) {
          var tempPath=path.resolve(srcDir,"index.js");
          var indexPath=tempPath.replace("src","Content");
          if(!files[indexPath]){
            files[indexPath]=[];
          }

          files[indexPath].push(temp); 
        }else{
          var stat = fs.statSync(path.resolve(srcDir,item));
          if(stat.isDirectory()){
            getFiles(path.resolve(srcDir,item),files);
          }
        } 
    });
  }

  getFiles(srcDir,files);
  //console.log(files);
  return files;
};

function getMinModuleEntry(srcDir){
  var files={};
  var getFiles=function(srcDir,files){
    var dirs = fs.readdirSync(srcDir);

    dirs.forEach(function (item) { 
        var temp,key;
        var matchs = [];
        matchs = item.match(/^.*?.js$/); 
        temp=path.resolve(srcDir,item);
        if(temp.indexOf("min.")>0){
          key=temp;
          temp=temp.replace("min.","");
        }else{
          key= path.resolve(srcDir,"min."+item);
        }
        
        if (matchs) {  
            files[key]=temp; 
        }else{
            var stat = fs.statSync(path.resolve(srcDir,item));
            if(stat.isDirectory()){
              getFiles(path.resolve(srcDir,item),files);
            }
        } 
        
    });
  }

  getFiles(srcDir,files)
  //console.log(files);
  return files;
} 
};