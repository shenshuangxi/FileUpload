package com.sundy.fileupload;

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
		
		String fileName = request.getParameter("fileName");
		String base = ContantConfig.winDirPath;
		String separator = ContantConfig.fileSeparator;
		if(separator.equals("/")){
			base = ContantConfig.linuxDirPath;
		}
		
		if(fileName==null){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("上传文件名参数空");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
		//检查文件是否已经上传合并
		String filePath = base+separator+fileName;
		if(!FileUtil.exist(filePath)){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage(fileName+" 文件不存在");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
		response.getWriter().write(JSON.toJSONString(rspMessage));
		
		
		
	}
	
}
