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
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<base href="<%=basePath%>">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
<!--引入CSS-->
<link rel="stylesheet" type="text/css" href="webuploader/webuploader.css" />
<!--引入JS-->
<script type="text/javascript" src="http://fex.baidu.com/webuploader/js/jquery-1.10.2.min.js"></script>
<script type="text/javascript" src="webuploader/webuploader.js"></script>
<script type="text/javascript" src="js/handler.js"></script>
<script type="text/javascript">
$(function(){  
	
	/*init webuploader*/  
	var $list=$("#thelist");   //这几个初始化全局的百度文档上没说明，好蛋疼。  
	var $btn =$("#ctlBtn");   //开始上传  
	
	var uploader = WebUploader.create({
		// 选完文件后，是否自动上传。  
	    auto: false,  
	    
	    runtimeOrder: flash,html5,  // 优先使用flash上传
	    
	  	//是否要分片处理大文件上传。
        chunked: true,

        // 如果要分片，分多大一片？ 默认大小为5M.
        chunkSize: 5 * 1024 * 1024,
        
        //分片重传次数
        chunkRetry: 2,
        
        //上传并发数
        threads: 3,
        
        //是否允许在文件传输时提前把下一个文件准备好。
        prepareNextFile: false,
        
     	// 去重
        duplicate: true,
        
	    // swf文件路径
	    swf: 'webupload/Uploader.swf',  
	    // 文件接收服务端。
	    server: '<%=uploadUrl.toString()%>',
	    // 选择文件的按钮。可选。
	    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
	    pick: '#picker',
	    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
	    resize: false
	});
	   
	//当有文件被添加进队列的时候
	uploader.on( 'fileQueued', function( file ) {
	    $list.append( '<div id="' + file.id + '" class="item">' +
	        '<h4 class="info">' + file.name + '</h4>' +
	        '<p class="state">等待上传...</p>' +
	    '</div>' );
	});

	//文件上传过程中创建进度条实时显示。
	uploader.on( 'uploadProgress', function( file, percentage ) {
	    var $li = $( '#'+file.id ),
	        $percent = $li.find('.progress .progress-bar');

	    // 避免重复创建
	    if ( !$percent.length ) {
	        $percent = $('<div class="progress progress-striped active">' +
	          '<div class="progress-bar" role="progressbar" style="width: 0%">' +
	          '</div>' +
	        '</div>').appendTo( $li ).find('.progress-bar');
	    }

	    $li.find('p.state').text('上传中');

	    $percent.css( 'width', percentage * 100 + '%' );
	    
	    showProgress(file,percentage*100,"divFileProgressContainer");
	    
	});

	uploader.on( 'uploadSuccess', function( file ) {
	    $( '#'+file.id ).find('p.state').text('已上传');
	});

	uploader.on( 'uploadError', function( file ) {
	    $( '#'+file.id ).find('p.state').text('上传出错');
	});

	uploader.on( 'uploadComplete', function( file ) {
	    $( '#'+file.id ).find('.progress').fadeOut();
	});

	$btn.on( 'click', function() {
	    console.log("上传...");  
	    uploader.upload();  
	    console.log("上传成功");  
	});
	   
});


</script>
</head>
<body>

<div id="uploader" class="wu-example">
    <!--用来存放文件信息-->
    <div id="thelist" class="uploader-list"></div>
    <div class="btns">
        <div id="picker">选择文件</div>
        <button id="ctlBtn" class="btn btn-default">开始上传</button>
    </div>
    <div id="divFileProgressContainer"></div>
</div>

</body>
</html>