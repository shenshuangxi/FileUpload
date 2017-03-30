
/** 实现webupload hook，触发上传前，中，后的调用关键 **/
WebUploader.Uploader.register({
    "before-send-file": "beforeSendFile",  // 整个文件上传前
    "before-send": "beforeSend",           // 每个分片上传前
    "after-send-file": "afterSendFile"     // 分片上传完毕
}, {
    beforeSendFile: function (file) {        
        var task = new $.Deferred();
        var start = new Date().getTime();

        //拿到上传文件的唯一名称，用于断点续传
        uniqueFileName = md5(file.name + file.size);
        
        $.ajax({
            type: "POST",
            url: check_url,   // 后台url地址
            data: {
                type: "init",
                uniqueFileName: uniqueFileName,
            },
            cache: false,
            async: false,  // 同步
            timeout: 1000, //todo 超时的话，只能认为该文件不曾上传过
            dataType: "json"
        }).then(function (data, textStatus, jqXHR) {            
            if (data.complete) { //若存在，这返回失败给WebUploader，表明该文件不需要上传                
                task.reject();
                // 业务逻辑...
                alert("文件已存在");
            } else {
                task.resolve();
            }
        }, function (jqXHR, textStatus, errorThrown) { //任何形式的验证失败，都触发重新上传
            task.resolve();
        });

        return $.when(task);
    }
    , beforeSend: function (block) {
        //分片验证是否已传过，用于断点续传
        var task = new $.Deferred();
        $.ajax({
            type: "POST",
            url: check_url,
            data: {
                type: "block",
                chunk: block.chunk,
                size: block.end - block.start
            },
            cache: false,
            async: false,  // 同步
            timeout: 1000, //todo 超时的话，只能认为该分片未上传过
            dataType: "json"
        }).then(function (data, textStatus, jqXHR) {
            if (data.is_exists) { //若存在，返回失败给WebUploader，表明该分块不需要上传
                task.reject();
            } else {
                task.resolve();
            }
        }, function (jqXHR, textStatus, errorThrown) { //任何形式的验证失败，都触发重新上传
            task.resolve();
        });
        return $.when(task);
    }
    , afterSendFile: function (file) {        
        var chunksTotal = Math.ceil(file.size / chunkSize);
        if (chunksTotal > 1) {
            //合并请求
            var task = new $.Deferred();
            $.ajax({
                type: "POST",
                url: check_url,
                data: {
                    type: "merge",
                    name: file.name,
                    chunks: chunksTotal,
                    size: file.size
                },
                cache: false,
                async: false,  // 同步
                dataType: "json"
            }).then(function (data, textStatus, jqXHR) {
                // 业务逻辑...
                
            }, function (jqXHR, textStatus, errorThrown) {
                current_uploader.uploader.trigger('uploadError');
                task.reject();
            });
            return $.when(task);
        }
    }
});


function showProgress(file,percent,targetId){
	var progress = new FileProgress(file, targetId);
	progress.setProgress(percent);
	if (percent === 100) {
		progress.setStatus("");//正在创建缩略图...
		progress.toggleCancel(false, this);
	} else {
		progress.setStatus("正在上传...");
		progress.toggleCancel(true, this);
	}
}


/* ******************************************
 *	FileProgress Object
 *	Control object for displaying file info
 * ****************************************** */

function FileProgress(file, targetID) {
	this.fileProgressID = "divFileProgress";

	this.fileProgressWrapper = document.getElementById(this.fileProgressID);
	if (!this.fileProgressWrapper) {
		this.fileProgressWrapper = document.createElement("div");
		this.fileProgressWrapper.className = "progressWrapper";
		this.fileProgressWrapper.id = this.fileProgressID;

		this.fileProgressElement = document.createElement("div");
		this.fileProgressElement.className = "progressContainer";

		var progressCancel = document.createElement("a");
		progressCancel.className = "progressCancel";
		progressCancel.href = "#";
		progressCancel.style.visibility = "hidden";
		progressCancel.appendChild(document.createTextNode(" "));

		var progressText = document.createElement("div");
		progressText.className = "progressName";
		progressText.appendChild(document.createTextNode("上传文件: "+file.name));

		var progressBar = document.createElement("div");
		progressBar.className = "progressBarInProgress";

		var progressStatus = document.createElement("div");
		progressStatus.className = "progressBarStatus";
		progressStatus.innerHTML = "&nbsp;";

		this.fileProgressElement.appendChild(progressCancel);
		this.fileProgressElement.appendChild(progressText);
		this.fileProgressElement.appendChild(progressStatus);
		this.fileProgressElement.appendChild(progressBar);

		this.fileProgressWrapper.appendChild(this.fileProgressElement);
		document.getElementById(targetID).style.height = "75px";
		document.getElementById(targetID).appendChild(this.fileProgressWrapper);
		fadeIn(this.fileProgressWrapper, 0);

	} else {
		this.fileProgressElement = this.fileProgressWrapper.firstChild;
		this.fileProgressElement.childNodes[1].firstChild.nodeValue = "上传文件: "+file.name;
	}

	this.height = this.fileProgressWrapper.offsetHeight;

}
FileProgress.prototype.setProgress = function (percentage) {
	this.fileProgressElement.className = "progressContainer green";
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = percentage + "%";
};
FileProgress.prototype.setComplete = function () {
	this.fileProgressElement.className = "progressContainer blue";
	this.fileProgressElement.childNodes[3].className = "progressBarComplete";
	this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setError = function () {
	this.fileProgressElement.className = "progressContainer red";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setCancelled = function () {
	this.fileProgressElement.className = "progressContainer";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

};
FileProgress.prototype.setStatus = function (status) {
	this.fileProgressElement.childNodes[2].innerHTML = status;
};

FileProgress.prototype.toggleCancel = function (show, swfuploadInstance) {
	this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
};


function fadeIn(element, opacity) {
	var reduceOpacityBy = 5;
	var rate = 30;	// 15 fps


	if (opacity < 100) {
		opacity += reduceOpacityBy;
		if (opacity > 100) {
			opacity = 100;
		}

		if (element.filters) {
			try {
				element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
			}
		} else {
			element.style.opacity = opacity / 100;
		}
	}

	if (opacity < 100) {
		setTimeout(function () {
			fadeIn(element, opacity);
		}, rate);
	}
}