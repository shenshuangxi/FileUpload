package com.sundy.fileupload.util;

import java.io.File;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.List;

public class FileUtil {

	public static void makeDir(String filePath){
		File file = new File(filePath);
		if(!file.exists()){
			file.mkdir();
		}
	}
	
	public static Boolean exist(String filePath){
		File file = new File(filePath);
		if(!file.exists()){
			return false;
		}
		return true;
	}
	
	
	public static void mergeCacheFile(String srcFilePath,String targetFilePath) throws Exception{
		
	}
	
}
