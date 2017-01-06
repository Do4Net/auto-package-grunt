var  path =require('path');
var fs=require("fs"); 
var path = require('path');
var packageifo=require("./package.json");

function writeJshintFlage(srcDir){
  var files={};
  var getFiles=function(srcDir,files,sourcepath){
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

          if(item.indexOf(".tools")>0){
           var pathinfo= sourcepath+"/"+item;
            console.log(pathinfo+"----");
            fs.readFile(pathinfo, 'utf8', function (err, data) {
              if (err) throw err;
              if(data.indexOf("ignore:start")>0){
                return;
              }

              var sourceCode="/* jshint ignore:start */\n"+data+"\n/* jshint ignore:end */\n";
              fs.writeFile(pathinfo,sourceCode, function(){
                console.log(pathinfo+"success");
              });
            }); 
          }

          files[indexPath].push(temp); 
        }else{ 
          var stat = fs.statSync(path.resolve(srcDir,item));
          if(stat.isDirectory()){
           var path1=sourcepath+"/"+item;
            getFiles(path.resolve(srcDir,item),files,path1);
          }
        } 
    });
  }

  getFiles(srcDir,files,srcDir);
 // console.log(files);
  return files;
};

writeJshintFlage(packageifo.jspath.commonsrc);
 


