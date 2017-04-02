;
var GnifUpload = (function() {
	
	function FileCaches(filename, fullsize, file, cacheFiles) {
		this.filename = filename;
		this.fullsize = fullsize;
		this.file = file;
		this.cacheFiles = cacheFiles;
		this.percent = 0;

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

	function CacheFile(filename, fullSize, order, data) {
		this.filename = filename;
		this.fullSize = fullSize;
		this.order = order;
		this.data = data;
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

	function updateProgress(cacheFile, hasLoad) {
		pecent = 100 * (hasLoad + cacheFile.getOrder())
				/ cacheFile.getFullSize();
		if (pecent > 100) {
			pecent = 100;
		}
		var progressParentDom = document
				.getElementById(encodeURIComponent(cacheFile.getFilename()));
		var nodes = progressParentDom.children || progressParentDom.childNodes;

		var nodeArray = new Array();
		getAllChildren(nodes, nodeArray)
		nodeArray.forEach(function(node, index, arr) {
			if (node.id == "load") {
				node.style.width = pecent + '%';
				return;
			}
			if(node.id == 'percent'){
				node.innerHTML = parseFloat(pecent).toFixed(2) + '%';
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
					throw("xmlhttp.status: "+xmlhttp.status+" xmlhttp.responseText: "+xmlhttp.responseText);
				}
			}
		}
		if (!!data) {
			xmlhttp.send(data);
		} else {
			xmlhttp.send();
		}
	}

	function checkFileExist(checkFileUrl, filename) {
		var isSuccess = false;
		send("post", checkFileUrl, false, "fileName=" + filename,
				"application/x-www-form-urlencoded", null, function(data) {
					var jsondata = eval('(' + data + ')');
					console.log(jsondata);
					isSuccess = jsondata.isSuccess;
				});
		return isSuccess;
	}

	function mergeFile(megerUrl, parameter) {
		var isSuccess = false;
		send("post", megerUrl, false, parameter,
				"application/x-www-form-urlencoded", null, function(data) {
					var jsondata = eval('(' + data + ')');
					console.log(jsondata);
					isSuccess = jsondata.isSuccess;
				});
		return isSuccess;
	}

	function checkFileCacheExist(filename, fileCacheName, fileCacheSize) {
		var flag = false;
		send("post", cacheFileCheckUrl, false, "fileName=" + filename
				+ "&fileCacheName=" + fileCacheName + "&fileCacheSize="
				+ fileCacheSize, "application/x-www-form-urlencoded", null,
				function(data) {
					var jsondata = eval('(' + data + ')');
					console.log(jsondata);
					flag = jsondata.isSuccess;
				});
		return flag;
	}

	var fileCachesTemp;
	function getNextCacheFileFromUploadFileCaches(){
		while(!!!fileCachesTemp||fileCachesTemp.isEmpty()){
			if(!!fileCachesTemp&&fileCachesTemp.isEmpty()){
				mergeFile(fileMergeUrl, "fileName=" + encodeURIComponent(fileCachesTemp.getFilename()) + "&fileSize=" + fileCachesTemp.getFullsize())
				uploadFileCacheArray = uploadFileCacheArray.slice(1);
				if(uploadFileCacheArray.length==0){
					return null;
				}
			}
			if(uploadFileCacheArray.length==0){
				return null;
			}else{
				fileCachesTemp = uploadFileCacheArray[0];
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
		var isSuccess = checkFileCacheExist(cacheFile.getFilename(), cacheFile.getOrder(), cacheFile.getSize());
		if (!isSuccess) {
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
		} else {
			removeCacheFileFromUploadCaches();
			updateProgress(cacheFile, cacheFile.getSize());
			uploadCacheFile();
		}
	}


	const CACHE_FILE_LENGTH = 10 * 1024 * 1024;
	var uploadFileArray = new Array();// 待上传文件列表
	var uploadFileCacheArray = new Array();
	var fileCheckUrl;
	var fileMergeUrl;
	var cacheFileCheckUrl;
	var cacheFileUploadUrl;

	function _listFiles() {
		var li = document.getElementById('listFiles');
		li.innerHTML = "";

		uploadFileArray.length = 0;
		uploadFileCacheArray.length = 0;
		// 获取文件数,将所有文件放入待上传列表
		uploadFileArray = getAllFiles("gnifupfiles");
		if(!!!uploadFileArray||uploadFileArray.length==0){
			return;
		}
		uploadFileArray.forEach(function(file, index, array) {
			var element = document.createElement("div");
			element.id = encodeURIComponent(file.name);
			element.innerHTML = file.name
					+ "<div id='upimg'><div id='percent'></div><div id='load'></div></div>";
			li.appendChild(element);
		});
		
//		checkFileUploadInfo();
	}
	
//列出文件列表前做检测，，上传失败再次上传需要做检测，(上传途中不做检测)	
//	function checkFileUploadInfo(){
//		uploadFileArray.forEach(function(uploadFile, index, array) {
//			// 判断文件是否存在,如果存在，移往成功列表，不存在则上传
//			if (checkFileExist(fileCheckUrl, uploadFile.name)) {
//				completePorgress(uploadFile.name);
//				// 从上传列表移除
//				uploadFileArray = uploadFileArray.slice(index + 1);
//			}else {
//				// 分割文件
//				var start = 0;
//				var end;
//				var cacheFiles = new Array();
//				while (start < uploadFile.size) {
//					end = start + CACHE_FILE_LENGTH;
//					blob = uploadFile.slice(start, end);
//					var cacheFile = new CacheFile(uploadFile.name,
//							uploadFile.size, start + 1, blob);
//					cacheFiles.push(cacheFile);
//					start = end;
//				}
//				var fileCaches = new FileCaches(uploadFile.name,uploadFile.size, uploadFile, cacheFiles);
//				uploadFileCacheArray.push(fileCaches);
//			}
//			if (uploadFileCacheArray.length > 0) {
//				uploadCacheFileCheck();
//			}
//		});
//	}
//	
//	function uploadCacheFileCheck(){
//		var cacheFile = getNextCacheFileFromUploadFileCaches();
//		if(cacheFile==null){
//			return;
//		}
//		var isSuccess = checkFileCacheExist(cacheFile.getFilename(), cacheFile.getOrder(), cacheFile.getSize());
//		if (!isSuccess) {
//			
//		} else {
//			updateProgress(cacheFile, cacheFile.getSize());
//			uploadCacheFile();
//		}
//	}
	
	
	function _startUploadFiles() {
		try {
			if(!!!uploadFileArray||uploadFileArray.length==0){
				return;
			}
			// 获取单个文件上传
			uploadFileArray.forEach(function(uploadFile, index, array) {
				// 判断文件是否存在,如果存在，移往成功列表，不存在则上传
				if (checkFileExist(fileCheckUrl, uploadFile.name)) {
					completePorgress(uploadFile.name);
					// 从上传列表移除
					uploadFileArray = uploadFileArray.slice(index + 1);
				} else {
					// 分割文件
					var start = 0;
					var end;
					var cacheFiles = new Array();
					while (start < uploadFile.size) {
						end = start + CACHE_FILE_LENGTH;
						blob = uploadFile.slice(start, end);
						var cacheFile = new CacheFile(uploadFile.name,
								uploadFile.size, start + 1, blob);
						cacheFiles.push(cacheFile);
						start = end;
					}
					var fileCaches = new FileCaches(uploadFile.name,
							uploadFile.size, uploadFile, cacheFiles);
					uploadFileCacheArray.push(fileCaches);
				}
			});
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
