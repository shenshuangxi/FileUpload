var GnifUpload = (function(){
	
	var ginfFiles = new Array();
	
	function _ajax(){
		var xmlhttp;
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
		function send(method,url,async,data){
			this.xmlhttp.open(method,url,async);
			this.xmlhttp.onreadystatechange=function(){
	    		if(this.readyState==4){
	     			if(this.status>=200&&this.status<300){
	      				if(this.responseText.indexOf('failed') >= 0){
	       					alert('文件发送失败，请重新发送');
	       					des.style.width='0%';
	      				}else{
	       					start=end;
	       					end=start+LENGTH;
	       					setTimeout('up()',1000);
	      				}
	     			}
	    		}
	   		}
			this.xmlhttp.send(data);
		}
	}
	
	
	function _ltrim(str){
		return str.replace(/(^\s*)/g,"");
	};
	
	function _rtrim(str){
		return str.replace(/(\s*$)/g,"");
	};
	
	function _trim(str){
		return _rtrim(_ltrim(str));
	};
	
	function _getDom(target){
		var trimTaget = _trim(target);
		var firstChar = trimTaget.charAt(0);
		var dom;
		if(firstChar=='#'){
			dom = document.getElementById(_ltrim(target.substring(1)));
		}else{
			dom = document.getElementsByTagName(trimTaget);
			if(!!!dom.length){
				dom = document.getElementsByName(trimTaget);
			}
		}
		return dom;
	};
	
	function _listFile(){
		ginfFiles.length = 0;
		var fileDom = document.getElementById('_files');
		for(var i=0;i<fileDom.files.length;i++){
			ginfFiles.push(fileDom.files[i]);
		}
		_showFiles();
	};
	
	function _showFiles(){
		if(!!ginfFiles.length){
			var li = document.getElementById('_listFiles');
			li.innerHTML = "";
			ginfFiles.forEach(function(file,index,array){
	 			var element = document.createElement("div");
	 			element.innerHTML = file.name;
	 			li.appendChild(element);
	 		});
		}
	}
	
	function _uploadFile(method,url,async){
		ginfFiles.forEach(function(file,index,array){
			const LENGTH=10*1024*1024;
			var start;
			var end;
			var blob;
			var pecent;
			while(start<file.size){
				end=start+LENGTH;
				blob=file.slice(start,end);
			   	fd=new FormData();
			   	fd.append('mof',blob);
			   	fd.append('test',file.name);
			   	_ajax().send(method,url,async,fd);
			   	start=end;
			}
			
 		});
	};
	
	function _showDiagram(target){
		var dom = _getDom(target);
		if(!!dom){
			return dom.innerHTML = "<form enctype='multipart/form-data'>" +
										"<div id='_upimg'>"+
												"<div id='load'></div>" +
										"</div>" +
										"<input type='file' id='_files' multiple='multiple' onchange='GnifUpload.listFile();' />" +
										"<input type='button' value='uploadfile' onclick='upfile();' />" +
									"</form>" +
									"<div id='_listFiles'></div>";
		}
		return ;
	}
	
	return {
		dom : _getDom,
		ajax : _ajax,
		trim : _trim,
		ltrim : _ltrim,
		rtrim : _rtrim,
		listFile : _listFile,
		showDiagram : _showDiagram,
		uploadFile : _uploadFile
		
	};
})();


