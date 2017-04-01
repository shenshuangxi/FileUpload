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
<script type="text/javascript" src="js/fileupload.js"></script>
<link rel="stylesheet" type="text/css" href="js/fileupload.css" />
</head>
<body>
	<!-- <form enctype="multipart/form-data">
		<div id="upimg">
			<div id="load"></div>
		</div>
		<input type="file" id="files" multiple="multiple"  />
		<input type="button" value="uploadfile" onclick="start();" />
	</form>
	<div id="test">测试是否DIV消失</div> -->
	<div id="gnifUploadFiles"></div>
</body>
<script type="text/javascript">
/* function start(){
	startUploadFiles("/fileupload/FileCheckServlet.htm1","/fileupload/FileUploadServlet.htm1","/fileupload/FileMergeServlet.htm1","files");
} */
GnifUpload.showDiagram("/fileupload/FileCheckServlet.htm1","/fileupload/FileMergeServlet.htm1","/fileupload/CacheFileCheckServlet.htm1","/fileupload/FileUploadServlet.htm1",'gnifUploadFiles');
</script>
</html>