package com.sundy.fileupload;

import java.io.File;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alibaba.fastjson.JSON;
import com.sundy.fileupload.contant.ContantConfig;
import com.sundy.fileupload.message.RspMessage;
import com.sundy.fileupload.util.FileUtil;
import com.sundy.fileupload.util.MD5Util;

public class FileCheckServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request,response);
	}
	public void doPost(HttpServletRequest request, HttpServletResponse response)throws ServletException, IOException {
		
		response.setCharacterEncoding("utf-8");
		request.setCharacterEncoding("utf-8");
		
		//body true 表示不需上传
		RspMessage rspMessage = new RspMessage(true, "文件已存在", true);
		
		String fileName = request.getParameter("fileName");
		String fileCacheName = request.getParameter("fileCacheName")==null?null:request.getParameter("fileCacheName");
		Long fileCacheSize = request.getParameter("fileCacheSize")==null?null:Long.parseLong(request.getParameter("fileCacheName"));
		
		String base = ContantConfig.winDirPath;
		String separator = ContantConfig.fileSeparator;
		if(separator.equals("/")){
			base = ContantConfig.linuxDirPath;
		}
		
		//检查文件是否已经上传合并
		String filePath = base+separator+fileName;
		if(FileUtil.exist(filePath)){
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
		//检测是否已经上传了
		try {
			String cacheFileDir = base+separator+MD5Util.encoderByMd5(fileName);
			if(!FileUtil.exist(cacheFileDir)){
				rspMessage.setBody(false);
				rspMessage.setMessage("还没开始上传");
				response.getWriter().write(JSON.toJSONString(rspMessage, true));
				return ;
			}
		} catch (Exception e) {
			e.printStackTrace();
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage(e.getMessage());
			rspMessage.setBody(e);
			response.getWriter().write(JSON.toJSONString(rspMessage, true));
			return;
		}
		
		try {
			if(fileCacheName!=null){
				String cacheFilePath = base+separator+MD5Util.encoderByMd5(fileName)+separator+fileCacheName;
				if(!FileUtil.exist(cacheFilePath)){
					rspMessage.setBody(false);
					rspMessage.setMessage("还没开始上传");
					response.getWriter().write(JSON.toJSONString(rspMessage, true));
					return ;
				}else{
					if(fileCacheSize!=null){
						File file = new File(cacheFilePath);
						long currentLength = file.length();
						if(currentLength==fileCacheSize){
							rspMessage.setBody(true);
							rspMessage.setMessage("文件已存在，不需再次上传");
							response.getWriter().write(JSON.toJSONString(rspMessage, true));
							return ;
						}else{
							file.delete();
							rspMessage.setBody(false);
							rspMessage.setMessage("文件已存在，但长度不一致，需重新上传");
							response.getWriter().write(JSON.toJSONString(rspMessage, true));
							return ;
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			rspMessage.setBody(e);
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage(e.getMessage());
			response.getWriter().write(JSON.toJSONString(rspMessage, true));
		}
		
		response.getWriter().write(JSON.toJSONString(rspMessage, true));
		
	}
	
}
