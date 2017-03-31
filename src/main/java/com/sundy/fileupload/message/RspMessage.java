package com.sundy.fileupload.message;

public class RspMessage {

	private Boolean isSuccess;
	private String message;
	private Object body;
	
	public RspMessage(Boolean isSuccess, String message, Object body) {
		this.isSuccess = isSuccess;
		this.message = message;
		this.body = body;
	}
	
	public Boolean getIsSuccess() {
		return isSuccess;
	}
	public void setIsSuccess(Boolean isSuccess) {
		this.isSuccess = isSuccess;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public Object getBody() {
		return body;
	}
	public void setBody(Object body) {
		this.body = body;
	}
	
	
	
}
