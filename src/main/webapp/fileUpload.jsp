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
<script type="text/javascript" src="js/fileupload.js"></script>
</head>
<body>
	<form enctype="multipart/form-data">
		<div id="upimg">
			<div id="load"></div>
		</div>
		<input type="file" id="files" multiple="multiple"  />
		<input type="button" value="uploadfile" onclick="start();" />
	</form>
	<div id="test">测试是否DIV消失</div>
</body>
<script type="text/javascript">
function start(){
	startUploadFiles("/fileupload/FileCheckServlet.htm1","/fileupload/FileUploadServlet.htm1","/fileupload/FileMergeServlet.htm1","files");
}

</script>
</html>