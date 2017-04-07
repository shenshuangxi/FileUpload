package com.sundy.fileupload;

import java.io.File;
import java.io.FileFilter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
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
		RspMessage rspMessage = new RspMessage(true, "合并成功");
		try {
			String fileName = request.getParameter("fileName");
			String md5 = request.getParameter("md5");
			String base = FileUtil.getBase();
			if(fileName==null){
				rspMessage.setIsSuccess(false);
				rspMessage.setMessage("上传文件名参数空");
				response.getWriter().write(JSON.toJSONString(rspMessage));
				return ;
			}
			if(md5==null){
				rspMessage.setIsSuccess(false);
				rspMessage.setMessage("上传文件md5参数空");
				response.getWriter().write(JSON.toJSONString(rspMessage));
				return ;
			}
			
			String targetFilePath = base+ContantConfig.fileSeparator+fileName;
			File targetFile = new File(targetFilePath);
			
			String srcDirFilePath = base+ContantConfig.fileSeparator+md5;
			File srcDirFile = new File(srcDirFilePath);
			if(srcDirFile.isDirectory()&&srcDirFile.exists()){
				RandomAccessFile wraf = new RandomAccessFile(targetFile, "rw");
				int count = 0;
				try {
					File[] files = srcDirFile.listFiles();
					Arrays.sort(files, new Comparator<File>() {
						@Override
						public int compare(File o1, File o2) {
							long o1Index = Long.parseLong(o1.getName());
							long o2Index = Long.parseLong(o2.getName());
							long value = o1Index - o2Index;
							return value<0?-1:1;
						}
					});
					
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
							file.delete();
						}
						if(count!=0&&count%10==0){
							wraf.getChannel().force(true);
						}
					}
				} finally{
					wraf.close();
					srcDirFile.delete();
				}
			}else{
				rspMessage.setIsSuccess(false);
				rspMessage.setMessage(md5+"/"+fileName+"文件不存在");
				response.getWriter().write(JSON.toJSONString(rspMessage));
				return;
			}
			
			//检测MD5码是否一致
			String targetFilemd5 = FileUtil.getFileMd5(targetFilePath);
			if(!md5.equalsIgnoreCase(targetFilemd5)){
				targetFile.delete();
				rspMessage.setIsSuccess(false);
				rspMessage.setMessage(fileName+"文件上传内容有误,需重新上传");
				response.getWriter().write(JSON.toJSONString(rspMessage));
				return;
			}
			FileUtil.addProperty(md5, fileName);
			response.getWriter().write(JSON.toJSONString(rspMessage));
		} catch (Exception e) {
			e.printStackTrace();
			rspMessage.setIsSuccess(false);
			rspMessage.setMessage("服务端出错: "+e.getMessage());
			response.getWriter().write(JSON.toJSONString(rspMessage));
		}
		
	}
}
