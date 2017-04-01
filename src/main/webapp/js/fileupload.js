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
			this.cacheFiles = this.cacheFiles.slice(index);
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
				node.innerHTML = parseFloat(pecent).toFixed(2) + '%';
				return;
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
				node.innerHTML = '100%';
				return;
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
				}
			} else {
				throw (xmlhttp);
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

	function checkFileCacheExist(checkCacheUrl, filename, fileCacheName,
			fileCacheSize) {
		var flag = false;
		send("post", checkCacheUrl, false, "fileName=" + filename
				+ "&fileCacheName=" + fileCacheName + "&fileCacheSize="
				+ fileCacheSize, "application/x-www-form-urlencoded", null,
				function(data) {
					var jsondata = eval('(' + data + ')');
					console.log(jsondata);
					flag = jsondata.isSuccess;
				});
		return flag;
	}

	function uploadCacheFile(cacheFileCheckUrl, cacheUploadUrl, cachefile) {
		var isSuccess = checkFileCacheExist(cacheFileCheckUrl, cachefile
				.getFilename(), cachefile.getOrder(), cachefile.getSize());
		if (!isSuccess) {
			fd = new FormData();
			fd.append(cachefile.getFilename(), cachefile.getData());
			fd.append(cachefile.getOrder(), cachefile.getOrder());
			send("post", cacheUploadUrl, false, fd, null, cachefile, function(
					data) {
				var jsondata = eval('(' + data + ')');
				console.log(jsondata);
				isSuccess = jsondata.isSuccess;
			});
		} else {
			updateProgress(cachefile, cachefile.getSize());
		}
		return isSuccess;
	}

	function startUploadCacheFile(cacheFileCheckUrl, cacheFileUploadUrl) {
		uploadFileCacheArray.forEach(function(fileCaches, index, array) {
			if (!fileCaches.isEmpty()) {
				var indexArray = new Array();
				fileCaches.getCacheFiles().forEach(
						function(cachefile, index, array) {
							var isSuccess = uploadCacheFile(cacheFileCheckUrl,
									cacheFileUploadUrl, cachefile);
							if (isSuccess) {
								indexArray.push(index + 1);
							}
						});
				indexArray.forEach(function(index, i, arr) {
					fileCaches.removeCache(index);
				});
			}
		});
	}

	function startMergeCacheFile(fileMergeUrl) {
		var indexArray = new Array();
		uploadFileCacheArray.forEach(function(fileCaches, index, array) {
			if (fileCaches.isEmpty()) {
				if (mergeFile(fileMergeUrl, "fileName="
						+ encodeURIComponent(fileCaches.getFilename())
						+ "&fileSize=" + fileCaches.getFullsize())) {
					indexArray.push(index + 1);
				}
			}
		});
		indexArray.forEach(function(index, i, arr) {
			uploadFileCacheArray = uploadFileCacheArray.slice(index);
		});
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
		uploadFileArray.forEach(function(file, index, array) {
			var element = document.createElement("div");
			element.id = encodeURIComponent(file.name);
			element.innerHTML = file.name
					+ "<div id='upimg'><div id='load'></div></div>";
			li.appendChild(element);
		});
	}
	
	function _startUploadFiles() {
		console.log("hah");
		try {
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
			while (uploadFileCacheArray.length > 0) {
				startUploadCacheFile(cacheFileCheckUrl, cacheFileUploadUrl);
				startMergeCacheFile(fileMergeUrl, uploadFileCacheArray)
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
