package com.sundy.fileupload;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.alibaba.fastjson.JSON;
import com.sundy.fileupload.message.RspMessage;
import com.sundy.fileupload.util.MD5Util;


public class FileUploadServlet extends HttpServlet {	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request,response);
	}
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		response.setCharacterEncoding("utf-8");
		request.setCharacterEncoding("utf-8");
		
		RspMessage rspMessage = new RspMessage(true, "上传成功", true);
		
		DiskFileItemFactory factory = new DiskFileItemFactory();
		// 设置内存缓冲区，超过后写入临时文件
		factory.setSizeThreshold(10*1024*1024);
		// 设置临时文件存储位置
		String base = "d:\\uploadFiles";
		String separator = File.separator;
		if(separator.equals("/")){
			base = "/usr/local/src/upload";
		}
		File file = new File(base);
		if(!file.exists())
			file.mkdirs();
		factory.setRepository(file);
		ServletFileUpload upload = new ServletFileUpload(factory);
		// 设置单个文件的最大上传值
		upload.setFileSizeMax(10*1024*1024*1024l);
		// 设置整个request的最大值
		upload.setSizeMax(10*1024*1024*1024l);
		upload.setHeaderEncoding("UTF-8");
		try {
			List<?> items = upload.parseRequest(request);
			for (int i = 0 ;i < items.size(); i++){
				FileItem item = (FileItem) items.get(i);
				// 保存文件
				if (!item.isFormField() && item.getName().length() > 0) {
					String[] fileInfos = item.getFieldName().split("-");
					String realFileName = fileInfos[0];
					String fileStart = fileInfos[1];
					String fileDir = base + File.separator + MD5Util.encoderByMd5(realFileName);
					File dirFile = new File(fileDir);
					if(!dirFile.exists()){
						dirFile.mkdir();
					}
					String cacheFilePath = fileDir + File.separator + fileStart;
					File cacheFile = new File(cacheFilePath);
					if(cacheFile.exists()){
						cacheFile.delete();
						cacheFile = new File(cacheFilePath);
					}
					item.write(cacheFile);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage(e.getMessage());
			rspMessage.setBody(e);
		}
		response.getWriter().write(JSON.toJSONString(rspMessage));
	}
	
}
