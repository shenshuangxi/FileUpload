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
		RspMessage rspMessage = new RspMessage(true, "文件已存在");
		
		String md5 = request.getParameter("md5");
		String fileName = request.getParameter("fileName");
//		long fileSize = request.getParameter("fileSize")==null?0l:Long.parseLong(request.getParameter("fileSize"));
//		String base = FileUtil.getBase();
		
		if(md5==null){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("上传文件md5参数空");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
//		if(fileName==null){
//			rspMessage.setIsSuccess(false);
//			rspMessage.setMessage("上传文件名参数空");
//			response.getWriter().write(JSON.toJSONString(rspMessage));
//			return ;
//		}
//		
//		
//		//检查文件是否已经上传合并
//		String filePath = base+ContantConfig.fileSeparator+fileName;
//		if(!FileUtil.exist(filePath)){
//			rspMessage.setIsSuccess(false);
//			rspMessage.setMessage(fileName+" 文件不存在");
//			response.getWriter().write(JSON.toJSONString(rspMessage));
//			return ;
//		}
//		//检测文件大小是否一致
//		File file = new File(filePath);
//		if(file.length()!=fileSize){
//			file.delete();
//			rspMessage.setIsSuccess(false);
//			rspMessage.setMessage(fileName+" 文件大小不一致，需要重新上传");
//			response.getWriter().write(JSON.toJSONString(rspMessage));
//			return ;
//		}
		
		String value = FileUtil.getProperty(md5);
		if(value==null){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage(fileName+" 文件不存在");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return;
		}else{
			if(!value.contains(fileName)){
				FileUtil.addProperty(md5, fileName);
			}
		}
		
		response.getWriter().write(JSON.toJSONString(rspMessage));
		
		
		
	}
	
}
