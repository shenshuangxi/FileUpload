package com.sundy.fileupload.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alibaba.fastjson.JSON;
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
		
		RspMessage rspMessage = new RspMessage(true, "文件已存在");
		
		String md5 = request.getParameter("md5");
		String fileName = request.getParameter("fileName");
		
		if(md5==null){
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("上传文件md5参数空");
			response.getWriter().write(JSON.toJSONString(rspMessage));
			return ;
		}
		
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
