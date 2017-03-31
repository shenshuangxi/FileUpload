//内部存放文件信息 file
var failFileArray = new Array(); //上传失败文件列表
var successFileArray = new Array();//上传成功文件列表
var uploadFileArray = new Array();//待上传文件列表

//存放分割文件信息fileCache array(cacheFile)
//cacheFile(文件名，分割前文件大小，分割次序,数据)
var uploadFileCacheArray = new Array();//已分割待上传文件列表
var successFileCacheArray = new Array();//已分割上传成功列表
var failFileCacheArray = new Array();//已分割，上传失败列表

function FileCaches(filename,fullsize,file,cacheFiles){
	this.filename = filename;
	this.fullsize = fullsize;
	this.file = file;
	this.cacheFiles = cacheFiles;
	
	this.getFullsize = function(){
		return this.fullsize;
	}
	this.getFilename = function(){
		return this.filename;
	}
	this.getCacheFiles = function(){
		return this.cacheFiles;
	}
	
	this.getFile = function(){
		return this.file;
	}
	this.removeCache = function(index){
		this.cacheFiles = this.cacheFiles.slice(index+1);
	}
}

function CacheFile(order,data){
	this.order = order;
	this.data = data;
	this.getOrder = function(){
		return this.order;
	}
	this.getData = function(){
		return this.data;
	}
}

const CACHE_FILE_LENGTH = 10*1024*1024;

function getAllFiles(targetId){
	var domFile = document.getElementById(targetId);
	var files = domFile.files;
	if(!!!files.length){
		alert('请选择文件');
		return;
	}
	for(var i=0;i<files.length;i++){
		uploadFileArray.push(files[i]);
	}
}

function send(method,url,async,data,contentType,callFunc){
	var xmlhttp = null;
	if (window.XMLHttpRequest)
	{
	    //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
	    xmlhttp=new XMLHttpRequest();
	}
	else
	{
	    // IE6, IE5 浏览器执行代码
	    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.open(method,url,async);
	if(!!contentType){
		xmlhttp.setRequestHeader("Content-type", contentType);
	}
	xmlhttp.onreadystatechange=function(){
		if(xmlhttp.readyState==4){
 			if(xmlhttp.status>=200&&xmlhttp.status<300){
 				callFunc(xmlhttp.responseText);
 			}
		}else{
			console.log('ajax 异常');
			return false;
		}
	}
	if(!!data){
		xmlhttp.send(data);
	}else{
		xmlhttp.send();
	}
}

function judgeFileExist(url,filename){
	var flag = false;
	send("post",url,false,"fileName="+filename,"application/x-www-form-urlencoded",function(data){
		var jsondata = eval('(' + data + ')'); 
		console.log(jsondata);
		if(jsondata.isSuccess){
			flag = jsondata.body;
		}else{
			throw(jsondata.message);
		}
	});
	return flag;
}

function startUploadCacheFile(cacheUploadUrl,megerUrl){
	uploadFileCacheArray.forEach(function(fileCache,index,array){
		fileCache.getCacheFiles().forEach(function(cachefile,index,array){
			fd=new FormData();
		   	fd.append(fileCache.getFilename()+"-"+cachefile.getOrder(),cachefile.getData());
		   	send("post",cacheUploadUrl,false,fd,null,function(data){
				var jsondata = eval('(' + data + ')'); 
				console.log(jsondata);
				if(jsondata.isSuccess){
					if(jsondata.body){
						fileCache.removeCache(index);
					}
				}else{
					throw(jsondata.message);
				}
		   	});
		});
		if(!!!fileCache.getCacheFiles().length){
			startMerge(megerUrl,"fileName="+encodeURIComponent(fileCache.getFilename())+"&fileSize="+fileCache.getFullsize(),fileCache.getFile())
		}
	});
}

function startMerge(megerUrl,parameter,file){
	send("post",megerUrl,true,parameter,"application/x-www-form-urlencoded",function(data){
		var jsondata = eval('(' + data + ')'); 
		console.log(jsondata);
		if(jsondata.isSuccess){
			if(jsondata.body){
				successFileArray.push(file);
			}else{
				failFileArray.push(file);
			}
		}else{
			throw(jsondata.message);
		}
   	});
}



function startUploadFiles(checkurl,cacheUrl,megerUrl,fileDomId){
	try{
		//获取文件数,将所有文件放入待上传列表
		getAllFiles(fileDomId);
		//获取单个文件上传
		uploadFileArray.forEach(function(file,index,array){
			//判断文件是否存在,如果存在，移往成功列表，不存在则上传
			if(judgeFileExist(checkurl,file.name)){
				//文件已存在，将文件移往成功列表
				successFileArray.push(file);
				uploadFileArray = uploadFileArray.slice(index+1);
			}else{
				//分割文件
				var start = 0;
				var end;
				var count = 1;
				var cacheFiles = new Array();
				while(start<file.size){
					end = start + CACHE_FILE_LENGTH;
					blob=file.slice(start,end);
					var cacheFile = new CacheFile(count++,blob);
					cacheFiles.push(cacheFile);
					start=end;
				}
				var fileCache = new FileCaches(file.name,file.size,file,cacheFiles);
				uploadFileCacheArray.push(fileCache);
			}
		});
		startUploadCacheFile(cacheUrl,megerUrl);
	}catch(e){
		alert(e);
	}
}


