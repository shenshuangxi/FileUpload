<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
	StringBuffer uploadUrl = new StringBuffer("http://");
	uploadUrl.append(request.getHeader("Host"));
	uploadUrl.append(request.getContextPath());
	uploadUrl.append("/FileUploadServlet.htm1");
	System.out.println("uploadUrl====>"+uploadUrl);
%>
<html>
<head>
<base href="<%=basePath%>">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>分割大文件上传</title>
<style>
#test {
	width: 200px;
	height: 100px;
	border: 1px solid green;
	display: none;
}

#img {
	width: 50px;
	height: 50px;
	display: none;
}

#upimg {
	text-align: center;
	font: 8px/10px '微软雅黑', '黑体', sans-serif;
	width: 300px;
	height: 10px;
	border: 1px solid green;
}

#load {
	width: 0%;
	height: 100%;
	background: green;
	text-align: center;
}
</style>
</head>
<body>
	<form enctype="multipart/form-data" action="/fileupload/FileUploadServlet.htm1" method="post">
		<div id="upimg">
			<div id="load"></div>
		</div>
		<input type="file" name="mof" multiple="multiple" />
		<input type="button" value="uploadfile" onclick="upfile();" />
	</form>
	<div id="test">测试是否DIV消失</div>
	<script type="text/javascript">
	var dom=document.getElementsByTagName('form')[0];
	var xhr=new XMLHttpRequest();
	var des=document.getElementById('load');
	var num=document.getElementById('upimg');
	var fd;
	var file;
	const LENGTH=10*1024*1024;
	var start;
	var end;
	var blob;
	var pecent;
	var filename;
	function upfile(){
 		start=0;
 		end=LENGTH+start;
 		var mofs = document.getElementsByName('mof');
 		var files = document.getElementsByName('mof')[0].files;
 		file=document.getElementsByName('mof')[0].files[0];
 		if(!file){
  			alert('请选择文件');
  			return;
 		}
 		up();
	}

 	function up(){
  		if(start<file.size){
   			xhr.open('POST','/fileupload/FileUploadServlet.htm1',true);
   			xhr.onreadystatechange=function(){
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
	   		xhr.upload.onprogress=function(ev){
		    	if(ev.lengthComputable){
		     		pecent=100*(ev.loaded+start)/file.size;
		     		if(pecent>100){
		      			pecent=100;
		     		}
		     		des.style.width=pecent+'%';
		     		des.innerHTML = parseInt(pecent)+'%'
		    	}
		   	}
		　　　//分割文件核心部分slice
		   	blob=file.slice(start,end);
		   	fd=new FormData();
		   	fd.append('mof',blob);
		   	fd.append('test',file.name);
		   	xhr.send(fd);
  		}else{
   			//clearInterval(clock);
  		}
 	}

	 function change(){
	  	des.style.width='0%';
	 }
 
</script>
</body>
</html>