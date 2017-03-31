package com.sundy.fileupload;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alibaba.fastjson.JSON;
import com.sundy.fileupload.contant.ContantConfig;
import com.sundy.fileupload.message.RspMessage;
import com.sundy.fileupload.util.FileUtil;
import com.sundy.fileupload.util.MD5Util;

public class FileMergeServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request,response);
	}
	public void doPost(HttpServletRequest request, HttpServletResponse response)throws ServletException, IOException {
		response.setCharacterEncoding("utf-8");
		request.setCharacterEncoding("utf-8");
		RspMessage rspMessage = new RspMessage(true, "合并成功", true);
		try {
			String fileName = request.getParameter("fileName");
			long fileSize = request.getParameter("fileSize")==null?0:Long.parseLong(request.getParameter("fileSize"));
			String base = ContantConfig.winDirPath;
			String separator = ContantConfig.fileSeparator;
			if(separator.equals("/")){
				base = ContantConfig.linuxDirPath;
			}
			String targetFilePath = base+separator+fileName;
			String srcFilePath;
			srcFilePath = base+separator+MD5Util.encoderByMd5(fileName);
			File targetFile = new File(targetFilePath);
			File dirFile = new File(srcFilePath);
			List<File> files = new ArrayList<File>();
			long cacheFilesSize = 0l;
			if(dirFile.exists()){
				for(File file : dirFile.listFiles()){
					cacheFilesSize = cacheFilesSize + file.length();
					files.add(file);
				}
			}
			
			if(fileSize==cacheFilesSize){
				RandomAccessFile wraf = new RandomAccessFile(targetFile, "rw");
				try {
					for(File file : files){
						ByteBuffer buf = ByteBuffer.allocate(1024);
						RandomAccessFile rraf = new RandomAccessFile(file, "r");
						try {
							while(rraf.getChannel().read(buf)>0){
								buf.flip();
								wraf.getChannel().write(buf);
								buf.rewind();
							}
						} finally{
							rraf.close();
						}
					}
				} finally{
					dirFile.delete();
					wraf.close();
				}
			}else{
				rspMessage.setBody(false);
				rspMessage.setMessage("文件长度:"+fileSize+"kb,接收文件长度: "+cacheFilesSize+"kb"+" 数据长度不一致");
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
