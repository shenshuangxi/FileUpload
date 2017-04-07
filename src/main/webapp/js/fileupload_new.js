;
var GnifFileUpload = (function(){
	
	function flashVersion(){
		var version;
	    try {
	        version = navigator.plugins[ 'Shockwave Flash' ];
	        version = version.description;
	    } catch ( ex ) {
	        try {
	            version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
	                    .GetVariable('$version');
	        } catch ( ex2 ) {
	            version = '0.0';
	        }
	    }
	    version = version.match( /\d+/g );
	    return parseFloat( version[ 0 ] + '.' + version[ 1 ], 10 );
	}
	
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
	
	var uploader;
	var $list;
	function _init(swfUrl,uploadFileCheckUrl,uploadCacheFileCheckUrl,uploadCacheFileUrl,uploadFileMerge,filePickerDiv,fileListDiv,updateProgressCallback){
		
		if(!WebUploader.Uploader.support('flash') && WebUploader.browser.ie ){
			if(flashVersion()){
				alert("flash版本过低");
			}else{
				alert("买有安装flash");
			}
			return;
		}else if(!WebUploader.Uploader.support()){
			alert("不支持该浏览器");
			return;
		}
		
		WebUploader.Uploader.register({  
			  "before-send-file":"beforeSendFile",  
			  "before-send":"beforeSend",  
			  "after-send-file":"afterSendFile",  
			},{  
			  //时间点1：所有分块进行上传之前调用此函数  
			  beforeSendFile:function(file){  
				  var deferred = WebUploader.Deferred();  
				  (new WebUploader.Uploader()).md5File(file,0,file.size).progress(function(percentage){
					  $('#'+file.id).find('p.state').text('文件分析中...');  
				  }).then(function(val){
					  file.md5 = val;
					  $.ajax({  
						  async:true,
				          type:"POST",  
				          url:uploadFileCheckUrl,  
				          data:{  
				              //文件唯一标记  
				              md5:file.md5,  
				              //当前分块下标  
				              fileName:file.name
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
			          url:uploadCacheFileCheckUrl,  
			          data:{  
			        	  //文件名称
			        	  fileName: block.file.name,
			              //文件唯一标记  
			              md5:block.file.md5,  
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
			      this.owner.options.formData.fileMd5 = block.file.md5; 
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
			          url:uploadFileMerge,  
			          data:{  
			        	//文件名称
			        	  fileName: file.name,
			              //文件唯一标记  
			              md5:file.md5
			          },  
			          success:function(response){ 
			        	  if(response.isSuccess){
			        		  $( '#'+file.id ).find('p.state').text('上传成功');
			        	  }else{
			        		  if(!!updateProgressCallback){
			        			  updateProgressCallback(file,0);
			        		  }else{
			        			  updateProgress(file,0);
			        		  }
			        		 
			        		  $( '#'+file.id ).find('p.state').text("上传失败，请刷新页面重新上传！！( 错误原因"+response.message+")");
			        	  }
			        	  deferred.resolve();
			          }  
			      });
			      return deferred.promise();
			  }  
			});  
		
		$list = $('#'+fileListDiv);
		
		uploader = WebUploader.create({
		    // swf文件路径
		    swf: swfUrl,  
		    // 文件接收服务端。
		    server: uploadCacheFileUrl,
		    //是否要分片处理大文件上传。
		    chunked: true,
		    // 如果要分片，分多大一片？ 默认大小为10M.
		    chunkSize: 10*1024*1024,
		    // 选择文件的按钮。可选。
		    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
		    pick: { id:'#'+filePickerDiv,multiple: true},
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
		
		//文件上传过程中创建进度条实时显示。
		uploader.on( 'uploadProgress', function( file, percentage ) {
			 if(!!updateProgressCallback){
	   			updateProgressCallback(file,0);
	   		 }else{
	   			updateProgress(file,percentage);
	   		 }
		});
		
		uploader.on( 'uploadError', function( file,reason ) {
			 if(reason=='该文件已上传'){
				 if(!!updateProgressCallback){
		   			 updateProgressCallback(file,0);
		   		 }else{
		   			 updateProgress(file,1);
		   		 }
				 $( '#'+file.id ).find('p.state').text('上传成功');
			 }else{
				 if(!!updateProgressCallback){
		   			updateProgressCallback(file,0);
		   		 }else{
		   			updateProgress(file,0);
		   		 }
				 
				 $( '#'+file.id ).find('p.state').text('上传出错');
			 }
		});
		
	}
	
	function _stop(){  
	    uploader.stop(true);  
	}  

	function _start(){  
	    uploader.upload();
	    if(uploader.getFiles().length==0){
	    	alert("请选择文件");
	    	return;
	    }
	}
	
	return {
		init : _init,
		start : _start,
		stop : _stop
	};
	
})();