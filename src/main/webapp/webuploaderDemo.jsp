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
<title>Insert title here</title>
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/webuploader/webuploader.js"></script>
<link rel="stylesheet" type="text/css" href="css/webuploader.css" />
</head>
<body>
<div id="uploader" class="wu-example">
	<div>
		<a href="http://www.adobe.com/go/getflashplayer" target="_blank" border="0">
			<img alt="get flash player" src="http://www.adobe.com/macromedia/style_guide/images/160x41_Get_Flash_Player.jpg" />
		</a>
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

var fileMd5;  
var filename;
//监听分块上传过程中的三个时间点  
WebUploader.Uploader.register({  
  "before-send-file":"beforeSendFile",  
  "before-send":"beforeSend",  
  "after-send-file":"afterSendFile",  
},{  
  //时间点1：所有分块进行上传之前调用此函数  
  beforeSendFile:function(file){  
	  console.log(file);
	  filename = file.name;
	  var deferred = WebUploader.Deferred();  
	  (new WebUploader.Uploader()).md5File(file,0,file.size).progress(function(percentage){
		  $('#'+file.id).find('p.state').text('文件分析中...');  
	  }).then(function(val){
		  fileMd5=val;
		  file.md5 = val;
		  $.ajax({  
			  async:true,
	          type:"POST",  
	          url:"<%=basePath%>/FileCheckServlet.htm1",  
	          data:{  
	              //文件唯一标记  
	              //md5:file.md5,
	              md5:fileMd5,
	              //当前分块下标  
	              //fileName:file.name
	              fileName:filename
	          },  
	          dataType:"json",  
	          success:function(response){  
	              if(response.isSuccess){  
	                  //文件存在，跳过  
	                  deferred.reject("该文件已上传");  
	              }else{  
	                  //文件不存在，重新发送文件
	                  deferred.resolve();  
	              }  
	          }  
	      }); 
	  });
	  return deferred.promise();
  },  
  //时间点2：如果有分块上传，则每个分块上传之前调用此函数  
  beforeSend:function(block){  
	  console.log(block);
      var deferred = WebUploader.Deferred(); 
      $.ajax({  
          type:"POST", 
          url:"<%=basePath%>CacheFileCheckServlet.htm1",  
          data:{  
        	  //文件名称
        	  //fileName: block.file.name,
        	  fileName: filename,
              //文件唯一标记  
              //md5:block.file.md5,  
              md5:fileMd5,  
              //当前分块名称，即起始位置
              fileCacheName:block.chunk!=0?block.chunk:block.chunks,  
              //当前分块大小  
              fileCacheSize:block.end-block.start  
          },  
          dataType:"json",  
          success:function(response){  
              if(response.isSuccess){
                  //分块存在，跳过  
                  deferred.reject();
              }else{  
                  //分块不存在或不完整，重新发送该分块内容  
                  deferred.resolve();  
              }  
          }  
      });  
      this.owner.options.formData.fileMd5 = fileMd5; 
      this.owner.options.formData.chunk = block.chunk!=0?block.chunk:block.chunks; 
      return deferred.promise();
  },  
  //时间点3：所有分块上传成功后调用此函数  
  afterSendFile:function(file){  
	  var deferred = WebUploader.Deferred();  
      //如果分块上传成功，则通知后台合并分块  
      $.ajax({  
          type:"POST",  
          dataType:"json", 
          url:"<%=basePath%>FileMergeServlet.htm1",  
          data:{  
        	//文件名称
        	  //fileName: file.name,
        	  fileName: filename,
              //文件唯一标记  
             // md5:file.md5,  
        	  md5:fileMd5,  
          },  
          success:function(response){ 
        	  if(response.isSuccess){
        		  $( '#'+file.id ).find('p.state').text('上传成功');
        	  }else{
        		  $( '#'+file.id ).find('p.state').text("上传失败，请重新上传！！( 错误原因"+response.message+")");
        		  updateProgress(file,0);
        	  }
        	  deferred.resolve();
          }  
      });
      return deferred.promise();
  }  
});  

var $list = $("#fileList");
var uploader = WebUploader.create({

    // swf文件路径
    swf: '<%=basePath%>js/webuploader/Uploader.swf',  

    // 文件接收服务端。
    server: '<%=basePath%>FileUploadServlet.htm1',

    //是否要分片处理大文件上传。
    chunked: true,

    // 如果要分片，分多大一片？ 默认大小为10M.
    chunkSize: 10*1024*1024,
    
    // 选择文件的按钮。可选。
    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
    pick: { id:'#filePicker',multiple: true},
    

    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
    resize: false
});



//当有文件被添加进队列的时候
uploader.on( 'fileQueued', function( file ) {
	var sizeText;
	if(file.size/1024/1024/1024>1){
		sizeText = parseFloat(file.size/1024/1024/1024).toFixed(2)+"Gb";
	}else if(file.size/1024/1024>1){
		sizeText = parseFloat(file.size/1024/1024).toFixed(2)+"Mb";
	}else if(file.size/1024>1){
		sizeText = parseFloat(file.size/1024).toFixed(2)+"kb";
	}else{
		sizeText = parseFloat(file.size).toFixed(2)+"b";
	}
    $list.append( '<div id="' + file.id + '" class="item">' +
        '<h4 class="info">' + file.name+"("+sizeText+")" + '</h4>' +
        '<p class="state">等待上传...</p>' +
    '</div>' );
});

var prevPercent;
var prevTime;
function updateProgress(file,percentage){
	var $li = $( '#'+file.id );
    var $percent = $li.find('#load');

    // 避免重复创建
    if ( !$percent.length ) {
    	$li.append("<div id='upimg'><div id='percent'></div><div id='speed'></div><div id='load'></div></div>");
        $percent = $li.find('#load');
    }
    $li.find('p.state').text('');
    $li.find('#percent').text(parseFloat(percentage * 100).toFixed(2) + '%');
    
	if(percentage>=1){
		prevPercent = null;
		prevTime = null;
		$li.find('#speed').text('');
	}else{
		var currentTime = new Date().getTime();
		var timePart;
		var speed;
		if(!!prevTime&&!!prevPercent){
			timePart = (currentTime - prevTime)/1000;
			var hasLoad = (percentage - prevPercent) * file.size;
			if((hasLoad/timePart)/1024/1024>1){
				speed = parseFloat((hasLoad/timePart)/1024/1024).toFixed(2)+"Mb/s";
			}else if((hasLoad/timePart)/1024>1){
				speed = parseFloat((hasLoad/timePart)/1024).toFixed(2)+"kb/s";
			}else{
				speed = parseFloat((hasLoad/timePart)).toFixed(2)+"b/s";
			}
		}else{
			speed = "0kb/s"; 
		}
		prevTime = currentTime;
		prevPercent = percentage;
		$li.find('#speed').text(speed);
	}
    $percent.css( 'width', percentage * 100 + '%' );
}
//文件上传过程中创建进度条实时显示。
uploader.on( 'uploadProgress', function( file, percentage ) {
	updateProgress(file,percentage);
});

//$( '#'+file.id ).find('p.state').text('已上传');
uploader.on( 'uploadSuccess', function( file ) {
   
});

uploader.on( 'uploadError', function( file,reason ) {
	 if(reason=='该文件已上传'){
		 $( '#'+file.id ).find('p.state').text('上传成功');
		 updateProgress(file,1);
	 }else{
		 $( '#'+file.id ).find('p.state').text('上传出错');
		 updateProgress(file,0);
	 }
});

//$( '#'+file.id ).find('.progress').fadeOut();
uploader.on( 'uploadComplete', function( file) {
    
});

function stop(){  
    uploader.stop(true);  
    $('#ctlBtn').attr("onclick","start()");  
    $('#ctlBtn').text("继续上传");  
}  

function start(){  
    uploader.upload();
    if(uploader.getFiles().length==0){
    	alert("请选择文件");
    	return;
    }
    $('#ctlBtn').attr("onclick","stop()");  
    $('#ctlBtn').text("取消上传");  
}  


$(function(){
	 $('#ctlBtn').attr("onclick","start()");
	 $('#ctlBtn').text("开始上传"); 
});

</script>
</html>