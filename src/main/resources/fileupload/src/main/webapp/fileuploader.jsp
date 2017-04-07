<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
	StringBuffer uploadUrl = new StringBuffer("http://");
	uploadUrl.append(request.getHeader("Host"));
	uploadUrl.append(request.getContextPath());
	uploadUrl.append("/FileUploadServlet.htm1");
	System.out.println("uploadUrl====>"+uploadUrl);
%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>文件上传</title>
<link rel="stylesheet" type="text/css" href="css/webuploader.css" />
<link rel="stylesheet" type="text/css" href="css/fileupload.css" />
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/webuploader.js"></script>
<script type="text/javascript" src="js/fileupload.js"></script>
</head>
<body>
<div id="uploader" class="wu-example">
	<div>
		<a href="http://www.adobe.com/go/getflashplayer" target="_blank" border="0">更新flash</a>
	</div>
    <!--用来存放文件信息-->
    <div id="fileList" class="uploader-list"></div>
    <div class="btns">
        <div id="filePicker">选择文件</div>
        <button id="ctlBtn" class="btn btn-default">开始上传</button>
    </div>
</div>
</body>
<script type="text/javascript">
GnifFileUpload.init(
		"<%=basePath%>js/webuploader/Uploader.swf",
		"<%=basePath%>/FileCheckServlet.htm1",
		"<%=basePath%>CacheFileCheckServlet.htm1",
		"<%=basePath%>FileUploadServlet.htm1",
		"<%=basePath%>FileMergeServlet.htm1",
		"filePicker",
		"fileList"
		);
function stop(){  
	GnifFileUpload.stop();  
    $('#ctlBtn').attr("onclick","start()");  
    $('#ctlBtn').text("继续上传");  
}  

function start(){  
	GnifFileUpload.start();
    $('#ctlBtn').attr("onclick","stop()");  
    $('#ctlBtn').text("取消上传");  
}  


$(function(){
	 $('#ctlBtn').attr("onclick","start()");
	 $('#ctlBtn').text("开始上传"); 
});



</script>
</html>