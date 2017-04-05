;
var GnifUpload = (function() {
	
	function FileCaches(filename, fullsize, fileMd5, file, cacheFiles) {
		this.filename = filename;
		this.fullsize = fullsize;
		this.fileMd5 = fileMd5;
		this.file = file;
		this.cacheFiles = cacheFiles;
		this.percent = 0;
		this.getFileMd5 = function() {
			return this.fileMd5;
		}
		this.getFullsize = function() {
			return this.fullsize;
		}
		this.getFilename = function() {
			return this.filename;
		}
		this.getCacheFiles = function() {
			return this.cacheFiles;
		}

		this.getFile = function() {
			return this.file;
		}
		this.removeCache = function(index) {
			this.cacheFiles = this.cacheFiles.slice(index+1);
		}

		this.length = function() {
			return this.cacheFiles.length;
		}
		this.isEmpty = function() {
			return this.cacheFiles.length == 0;
		}
		this.setPercent = function(percent) {
			this.percent = percent;
		}
		this.getPercent = function() {
			return this.percent;
		}

	}

	function CacheFile(filename, fullSize, allFileMD5, order, data) {
		this.filename = filename;
		this.fullSize = fullSize;
		this.order = order;
		this.data = data;
		this.allFileMD5 = allFileMD5;
		this.getFilename = function() {
			return this.filename;
		}
		this.getOrder = function() {
			return this.order;
		}
		this.getData = function() {
			return this.data;
		}
		this.getSize = function() {
			return this.data.size;
		}
		this.getAllFileMD5 = function() {
			return this.allFileMD5;
		}
		this.getFullSize = function() {
			return this.fullSize;
		}
	}
	;

	function getAllFiles(targetId) {
		var domFile = document.getElementById(targetId);
		var files = domFile.files;
		if (!!!files.length) {
			alert('请选择文件');
			return;
		}
		var fileArray = new Array();
		for (var i = 0; i < files.length; i++) {
			fileArray.push(files[i]);
		}
		return fileArray;
	}
	;

	function getAllChildren(nodes, nodeArray) {
		for (var i = 0; i < nodes.length; i++) {
			nodeArray.push(nodes[i]);
			getAllChildren(nodes[i].children || nodes[i].childNodes, nodeArray)
		}
	}
	
	function initProgress(){
		var progressParentDom = document.getElementById("listFiles");
		var nodes = progressParentDom.children || progressParentDom.childNodes;
		var nodeArray = new Array();
		getAllChildren(nodes, nodeArray)
		nodeArray.forEach(function(node, index, arr) {
			if (node.id == "load") {
				node.style.width = '0%';
			}
			if(node.id == 'percent'){
				node.innerHTML = '0.00%';
			}
		});
	}

	var prevTime;
	function updateProgress(cacheFile, hasLoad) {
		var progressParentDom = document.getElementById(encodeURIComponent(cacheFile.getFilename()));
		var nodes = progressParentDom.children || progressParentDom.childNodes;
		var nodeArray = new Array();
		getAllChildren(nodes, nodeArray);
		var nodeProgress;
		var nodeProgressText;
		var nodeSpeedText;
		nodeArray.forEach(function(node, index, arr) {
			if (node.id == "load") {
				nodeProgress = node;
			}
			if(node.id == 'percent'){
				nodeProgressText = node;
			}
			if(node.id == 'speed'){
				nodeSpeedText = node;
			}
		});
		var nodeProgressParent = nodeProgress.parentNode; 
		var pecent = parseFloat(nodeProgress.clientWidth)/parseFloat(nodeProgressParent.clientWidth);
		var newUploadPecent = hasLoad/cacheFile.getFullSize();
		pecent = 100 * (pecent + newUploadPecent);
		if (pecent > 100) {
			pecent = 100;
		}
		nodeProgress.style.width = pecent + '%';
		nodeProgressText.innerHTML = parseFloat(pecent).toFixed(2) + '%';
		if(pecent!=100){
			var currentTime = new Date().getTime();
			var timePart;
			var speed;
			if(!!prevTime){
				timePart = (currentTime - prevTime)/1000;
				if((hasLoad/timePart)/1024/1024>1){
					speed = parseFloat((hasLoad/timePart)/1024/1024).toFixed(2)+"Mb/s";
				}else if((hasLoad/timePart)/1024>1){
					speed = parseFloat((hasLoad/timePart)/1024).toFixed(2)+"kb/s";
				}else{
					speed = parseFloat((hasLoad/timePart)).toFixed(2)+"b/s";
				}
			}else{
				speed = "0kb/s"; 
			}
			prevTime = currentTime;
			nodeSpeedText.innerHTML = speed;
		}else{
			prevTime = null;
			prevLoad = null;
			nodeSpeedText.innerHTML = '';
		}
	}
	
	function resetProgress(filename) {
		var progressParentDom = document.getElementById(encodeURIComponent(filename));
		var nodes = progressParentDom.children || progressParentDom.childNodes;
		var nodeArray = new Array();
		getAllChildren(nodes, nodeArray);
		nodeArray.forEach(function(node, index, arr) {
			if (node.id == "load") {
				node.style.width = '0%';
			}
			if(node.id == 'percent'){
				node.innerHTML = '0.00%';
			}
			if(node.id == 'speed'){
				node.innerHTML = '';
			}
		});
	}

	function completePorgress(filename) {
		var progressParentDom = document
				.getElementById(encodeURIComponent(filename));
		var nodes = progressParentDom.children || progressParentDom.childNodes;

		var nodeArray = new Array();
		getAllChildren(nodes, nodeArray)
		nodeArray.forEach(function(node, index, arr) {
			if (node.id == "load") {
				node.style.width = '100%';
				return;
			}
			if(node.id == 'percent'){
				node.innerHTML = '100%';
			}
		});

	}

	function send(method, url, async, data, contentType, nonContentTypeData,
			callFunc) {
		try{
			var xmlhttp = null;
			if (window.XMLHttpRequest) {
				// IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
				xmlhttp = new XMLHttpRequest();
			} else {
				// IE6, IE5 浏览器执行代码
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.open(method, url, async);
			if (!!contentType) {
				xmlhttp.setRequestHeader("Content-type", contentType);
			}
			if (!!nonContentTypeData) {
				xmlhttp.upload.onprogress = function(ev) {
					if (ev.lengthComputable) {
						updateProgress(nonContentTypeData, ev.loaded);
					}
				}
			}
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
						callFunc(xmlhttp.responseText);
					}else{
						console.log(xmlhttp);
				        console.log(xmlhttp.responseText);
						alert("xmlhttp.status: "+xmlhttp.status+" 连接断开，数据发送出错");
					}
				}
			}
			if (!!data) {
				xmlhttp.send(data);
			} else {
				xmlhttp.send();
			}
		}catch(e){
			throw e;
		}
	}

	function checkFileExist(checkFileUrl, param) {
		var isSuccess = false;
		send("post", checkFileUrl, false, param, "application/x-www-form-urlencoded", null, function(data) {
					var jsondata = eval('(' + data + ')');
					console.log(jsondata);
					isSuccess = jsondata.isSuccess;
				});
		return isSuccess;
	}

	function mergeFile(megerUrl, parameter) {
		var jsonData;
		send("post", megerUrl, false, parameter,
				"application/x-www-form-urlencoded", null, function(data) {
					var jsondata = eval('(' + data + ')');
					console.log(jsondata);
					jsonData = jsondata;
				});
		return jsonData;
	}

	function checkFileCacheExist(param) {
		var exist;
		send("post", cacheFileCheckUrl, false, param, "application/x-www-form-urlencoded", null,
				function(data) {
					var jsondata = eval('(' + data + ')');
					console.log(jsondata);
					exist = jsondata.isSuccess;
				});
		return exist;
	}

	var fileCachesTemp;
	var fileCachesTempCopy; 
	function initFileCahesTemp(){
		fileCachesTemp = null;
	}
	
	//需要md5 验证
	function getNextCacheFileFromUploadFileCaches(){
		while(!!!fileCachesTemp||fileCachesTemp.isEmpty()){
			if(!!fileCachesTemp&&fileCachesTemp.isEmpty()){
				var jsonData = mergeFile(fileMergeUrl, "fileName=" + encodeURIComponent(fileCachesTemp.getFilename()) + "&md5=" + fileCachesTemp.getFileMd5());
				if(!jsonData.isSuccess){
					alert(jsonData.message);
					resetProgress(fileCachesTemp.getFilename());
					fileCachesTemp = new FileCaches(fileCachesTempCopy.getFilename(),fileCachesTempCopy.getFullsize(),fileCachesTempCopy.getFileMd5(),fileCachesTempCopy.getFile(),fileCachesTempCopy.getCacheFiles());;
					return;
				}
				uploadFileCacheArray = uploadFileCacheArray.slice(1);
			}
			if(uploadFileCacheArray.length==0){
				return null;
			}else{
				fileCachesTemp = uploadFileCacheArray[0];
				fileCachesTempCopy =  new FileCaches(fileCachesTemp.getFilename(),fileCachesTemp.getFullsize(),fileCachesTemp.getFileMd5(),fileCachesTemp.getFile(),fileCachesTemp.getCacheFiles());
			}
		}
		return fileCachesTemp.getCacheFiles()[0];
	}
	
	function removeCacheFileFromUploadCaches(){
		fileCachesTemp.removeCache(0);
	}
	

	function uploadCacheFile() {
		var cacheFile = getNextCacheFileFromUploadFileCaches();
		if(cacheFile==null){
			return;
		}
		fd = new FormData();
		fd.append(cacheFile.getFilename(), cacheFile.getData());
		fd.append(cacheFile.getOrder(), cacheFile.getOrder());
		send("post", cacheFileUploadUrl, true, fd, null, cacheFile, function(
				data) {
			var jsondata = eval('(' + data + ')');
			console.log(jsondata);
			isSuccess = jsondata.isSuccess;
			if(isSuccess){
				removeCacheFileFromUploadCaches(cacheFile);
				uploadCacheFile();
			}else{
				throw(jsondata.message+" : "+jsondata.body)
			}
		});

	}
	
	function getNextFile(){
		if(uploadFileArray.length>0){
			var tempFile = uploadFileArray[0];
			uploadFileArray = uploadFileArray.slice(1);
			return tempFile;
		}
	}
	
	function spiltFileAndCheck(file,md5){
		console.log(file.name+" , "+md5);
		var param = "fileName="+encodeURIComponent(file.name)+"&md5="+md5;
		if (checkFileExist(fileCheckUrl, param)) {
			completePorgress(file.name);
		} else {
			// 分割文件
			var start = 0;
			var end;
			var cacheFiles = new Array();
			while (start < file.size) {
				end = start + CACHE_FILE_LENGTH;
				blob = file.slice(start, end);
				var cacheFile = new CacheFile(file.name,file.size, md5, start + 1, blob);
				//判断该分割文件是否存在,如果存在就更新上传进度，如果不存在，则将该分割文件放入分割文件缓冲区
				var param = "fileName=" + cacheFile.getFilename() + "&fileCacheName=" + cacheFile.getOrder() + "&fileCacheSize=" + cacheFile.getSize();
				var exist = checkFileCacheExist(param);
				if(exist){
					updateProgress(cacheFile, cacheFile.getSize());
				}else{
					cacheFiles.push(cacheFile);
				}
				start = end;
			}
			var fileCaches = new FileCaches(file.name, file.size, md5, file, cacheFiles);
			uploadFileCacheArray.push(fileCaches);
		}
	}
	
	function generateMD5(callFunc){
		var file = getNextFile();
		if(!!!file){
			return;
		}
		
		var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
		chunks = Math.ceil(file.size / CACHE_FILE_LENGTH),
		currentChunk = 0,
		spark = new SparkMD5.ArrayBuffer(),
		
		fileReader = new FileReader();
		fileReader.onload = function (e) {
			spark.append(e.target.result);                   // Append array buffer
			currentChunk++;
			if (currentChunk < chunks) {
			    loadNext();
			} else {
				var digestHexStr = spark.end();
			    console.log(digestHexStr);
			    callFunc(file,digestHexStr);
			    generateMD5(callFunc);
			 }
		};
		fileReader.onerror = function () {
		    alert('oops, something went wrong.');
		};
		function loadNext() {
		    var start = currentChunk * CACHE_FILE_LENGTH;
		    var end = ((start + CACHE_FILE_LENGTH) >= file.size) ? file.size : start + CACHE_FILE_LENGTH;
		    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
		}
		loadNext();
	}
	
	function spiltAndCheckAllFiles(){
		//生成MD5，并检测分割文件
		generateMD5(spiltFileAndCheck);
	}

	const CACHE_FILE_LENGTH = 10 * 1024 * 1024;
	var uploadFileArray = new Array();// 待上传文件列表
	var uploadFileCacheArray = new Array();
	var fileCheckUrl;
	var fileMergeUrl;
	var cacheFileCheckUrl;
	var cacheFileUploadUrl;

	function init(){
		//初始化百分数
		initProgress();
		initFileCahesTemp();
		//文件分割检测
		spiltAndCheckAllFiles();
	}
	
	function _listFiles() {
		uploadFileArray.length = 0;
		uploadFileCacheArray.length = 0;
		try{
			var li = document.getElementById('listFiles');
			li.innerHTML = "";
			// 获取文件数,将所有文件放入待上传列表
			uploadFileArray = getAllFiles("gnifupfiles");
			if(!!!uploadFileArray||uploadFileArray.length==0){
				return;
			}
			uploadFileArray.forEach(function(file, index, array) {
				var element = document.createElement("div");
				element.id = encodeURIComponent(file.name);
				element.innerHTML = file.name + "<div id='upimg'><div id='percent'></div><div id='load'></div><div id='speed'></div></div>";
				li.appendChild(element);
			});
			init();
		}catch(e){
			alert(e);
		}
	}
	
	function _startUploadFiles() {
		try {
			if (uploadFileCacheArray.length > 0) {
				uploadCacheFile();
			}
		} catch (e) {
			alert(e);
		}
	}

	function _showDiagram(ofileCheckUrl, ofileMergeUrl, ocacheFileCheckUrl,
			ocacheFileUploadUrl, target) {
		fileCheckUrl = ofileCheckUrl;
		fileMergeUrl = ofileMergeUrl;
		cacheFileCheckUrl = ocacheFileCheckUrl;
		cacheFileUploadUrl = ocacheFileUploadUrl;
		var dom = document.getElementById(target);
		if (!!dom) {
			dom.innerHTML = "<div>"
					+ "<form enctype='multipart/form-data'>"
					+ "<input type='file' id='gnifupfiles' multiple='multiple' onchange='GnifUpload.listFiles();'/>"
					+ "<input type='button' value='uploadfile' onclick='GnifUpload.startUploadFiles();'/>"
					+ "</form>" + "<div id='listFiles'></div>" + "</div>";
		}
	}

	return {
		showDiagram : _showDiagram,
		listFiles : _listFiles,
		startUploadFiles : _startUploadFiles
	}

})()
