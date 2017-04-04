package com.sundy.fileupload;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alibaba.fastjson.JSON;
import com.sundy.fileupload.contant.ContantConfig;
import com.sundy.fileupload.message.RspMessage;
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
		RspMessage rspMessage = new RspMessage(true, "合并成功");
		try {
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
			
			String targetFilePath = base+separator+fileName;
			File targetFile = new File(targetFilePath);
			
			String srcDirFilePath = base+separator+MD5Util.encoderByMd5(fileName);
			File srcDirFile = new File(srcDirFilePath);
			List<File> cacheFiles = new ArrayList<File>();
			long cacheFilesSize = 0l;
			if(srcDirFile.isDirectory()&&srcDirFile.exists()){
				for(File file : srcDirFile.listFiles()){
					cacheFilesSize = cacheFilesSize + file.length();
					cacheFiles.add(file);
				}
			}else{
				rspMessage.setIsSuccess(false);
				rspMessage.setMessage(fileName+"文件的缓存文件夹"+srcDirFilePath+"不能存在,或不是文件夹");
				response.getWriter().write(JSON.toJSONString(rspMessage));
				return ;
			}
			
			RandomAccessFile wraf = new RandomAccessFile(targetFile, "rw");
			try {
				int count = 0;
				for(File cacheFile : cacheFiles){
					ByteBuffer buf = ByteBuffer.allocate(1024);
					RandomAccessFile rraf = new RandomAccessFile(cacheFile, "r");
					try {
						while(rraf.getChannel().read(buf)>0){
							buf.flip();
							wraf.getChannel().write(buf);
							buf.rewind();
						}
					} finally{
						rraf.close();
					}
					if(count!=0&&count%10==0){
						wraf.getChannel().force(true);
					}
				}
			} finally{
				for(File file : srcDirFile.listFiles()){
					file.delete();
				}
				srcDirFile.delete();
				wraf.close();
			}
			response.getWriter().write(JSON.toJSONString(rspMessage));
		} catch (Exception e) {
			e.printStackTrace();
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("服务端出错: "+e.getMessage());
			response.getWriter().write(JSON.toJSONString(rspMessage));
		}
		
	}
}
