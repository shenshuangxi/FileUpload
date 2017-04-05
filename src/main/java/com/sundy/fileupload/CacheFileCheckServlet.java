package com.sundy.fileupload;

import java.io.File;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alibaba.fastjson.JSON;
import com.sundy.fileupload.contant.ContantConfig;
import com.sundy.fileupload.message.RspMessage;
import com.sundy.fileupload.util.FileUtil;
import com.sundy.fileupload.util.MD5Util;

public class CacheFileCheckServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request,response);
	}
	public void doPost(HttpServletRequest request, HttpServletResponse response)throws ServletException, IOException {
		response.setCharacterEncoding("utf-8");
		request.setCharacterEncoding("utf-8");
		//body true 表示不需上传
		RspMessage rspMessage = new RspMessage(true, "文件已存在");
		
		String fileName = request.getParameter("fileName");
		String fileCacheName = request.getParameter("fileCacheName")==null?null:request.getParameter("fileCacheName");
		long fileCacheSize = request.getParameter("fileCacheSize")==null?0l:Long.parseLong(request.getParameter("fileCacheSize"));
		
		String base = FileUtil.getBase();
		if(fileName==null){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("上传文件名参数空");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
		if(fileCacheName==null){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("上传缓存文件名参数空");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
		if(fileCacheSize==0l){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("上传缓存文件长度参数为空");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
		try {
			String filePath = base+ContantConfig.fileSeparator+MD5Util.encoderByMd5(fileName);
			if(!FileUtil.exist(filePath)){
				rspMessage.setIsSuccess(false);
				rspMessage.setMessage(fileName+" 文件 "+fileCacheName+"还没开始上传");
				response.getWriter().write(JSON.toJSONString(rspMessage));
				return ;
			}
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("服务端出错: "+e.getMessage());
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		};
		
		try {
			String cacheFilePath = base+ContantConfig.fileSeparator+MD5Util.encoderByMd5(fileName)+ContantConfig.fileSeparator+fileCacheName;
			if(!FileUtil.exist(cacheFilePath)){
				rspMessage.setIsSuccess(false);
				rspMessage.setMessage(fileName+" 文件 "+fileCacheName+"还没开始上传");
				response.getWriter().write(JSON.toJSONString(rspMessage, true));
				return ;
			}else{
				File file = new File(cacheFilePath);
				long currentLength = file.length();
				if(currentLength==fileCacheSize){
					rspMessage.setIsSuccess(true);
					rspMessage.setMessage("文件已存在，不需再次上传");
					response.getWriter().write(JSON.toJSONString(rspMessage, true));
					return ;
				}else{
					file.delete();
					rspMessage.setIsSuccess(false);
					rspMessage.setMessage("文件已存在，但长度不一致，需重新上传");
					response.getWriter().write(JSON.toJSONString(rspMessage, true));
					return ;
				}
			}
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("服务端出错: "+e.getMessage());
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
		
	}
}
