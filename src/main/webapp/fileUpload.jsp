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
<!-- <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script> 
<script type="text/javascript" src="js/html5shiv.min.js"></script>
<script type="text/javascript" src="js/respond.min.js"></script> -->
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/webuploader/webuploader.js"></script>
<script type="text/javascript" src="js/spark-md5.js"></script>
<script type="text/javascript" src="js/fileupload.js"></script>
<link rel="stylesheet" type="text/css" href="css/fileupload.css" />
</head>
<body>
	<div id="gnifUploadFiles" ></div>
	<div>
		<form>
			<input type="file" id="asdwqe" multiple='multiple' onchange="getfiles();">
		</form>
	</div>
</body>
<script type="text/javascript">
function getfiles(){
	var uploader = WebUploader.create({
	    // swf文件路径
	    swf:  'js/webuploader/Uploader.swf',
	    // 选择文件的按钮。可选。
	    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
	    pick: '#asdwqe',
	    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
	    resize: false
	});
	var fileArray = uploader.getFiles();
	console.log(fileArray);
}
GnifUpload.showDiagram("/fileupload/FileCheckServlet.htm1","/fileupload/FileMergeServlet.htm1","/fileupload/CacheFileCheckServlet.htm1","/fileupload/FileUploadServlet.htm1",'gnifUploadFiles');
</script>
</html>