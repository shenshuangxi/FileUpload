package com.sundy.fileupload.util;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MD5Util {

	public static String byteHEX(byte[] bytes) {
		char[] Digit = { '0','1','2','3','4','5','6','7','8','9',
						 'A','B','C','D','E','F' };
		char [] ob = new char[2];
		StringBuilder sb = new StringBuilder();
		for(byte ib : bytes){
			ob[0] = Digit[(ib >>> 4) & 0X0F];
			ob[1] = Digit[ib & 0X0F];
			sb.append(ob[0]).append(ob[1]);
		}
		return sb.toString();
	}
	
	
	public static String encoderByMd5(String str) throws NoSuchAlgorithmException, UnsupportedEncodingException {
        //确定计算方法
        MessageDigest md5=MessageDigest.getInstance("MD5");
        //这两行可用base64替换
        byte[] bytes = md5.digest(str.getBytes("utf-8"));
        String newStr = byteHEX(bytes);
        
        return newStr;
    }
	
	public static void main(String args[]) throws Exception{
		String s = MD5Util.encoderByMd5("123");
		System.out.println(s);
	}

	
	
}
