;
var GnifMD5 = function(){
	
	/* 下面这些S11-S44实际上是一个4*4的矩阵，在原始的C实现中是用#define 实现的，
	   这里把它们实现成为static final是表示了只读，切能在同一个进程空间内的多个
	   Instance间共享*/
	const S11 = 7;
	const S12 = 12;
	const S13 = 17;
	const S14 = 22;

	const S21 = 5;
	const S22 = 9;
	const S23 = 14;
	const S24 = 20;

	const S31 = 4;
	const S32 = 11;
	const S33 = 16;
	const S34 = 23;

	const S41 = 6;
	const S42 = 10;
	const S43 = 15;
	const S44 = 21;
	
	const PADDING = [ -128, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
	var state = [4];
	var count = [2];
	var buffer = [64];
	
	var digestHexStr;
	var digest = [16];
	
	
	function str2UTF8(str){  
	    var bytes = new Array();   
	    var len,c;  
	    len = str.length;  
	    for(var i = 0; i < len; i++){  
	        c = str.charCodeAt(i);  
	        if(c >= 0x010000 && c <= 0x10FFFF){  
	            bytes.push(((c >> 18) & 0x07) | 0xF0);  
	            bytes.push(((c >> 12) & 0x3F) | 0x80);  
	            bytes.push(((c >> 6) & 0x3F) | 0x80);  
	            bytes.push((c & 0x3F) | 0x80);  
	        }else if(c >= 0x000800 && c <= 0x00FFFF){  
	            bytes.push(((c >> 12) & 0x0F) | 0xE0);  
	            bytes.push(((c >> 6) & 0x3F) | 0x80);  
	            bytes.push((c & 0x3F) | 0x80);  
	        }else if(c >= 0x000080 && c <= 0x0007FF){  
	            bytes.push(((c >> 6) & 0x1F) | 0xC0);  
	            bytes.push((c & 0x3F) | 0x80);  
	        }else{  
	            bytes.push(c & 0xFF);  
	        }  
	    }  
	    return bytes;  
	}  
	
	function singleLong(v){
		var long_max = 2^63 - 1;
		var long_min = -2^63;
		var long_value = 2^64;
		if(v>long_max){
			v = v - long_max;
		}else if(v<long_min){
			v = long_value + v;
		}
		return v;
	}
	
	function singleInt(v){
		var int_max = 2^31 - 1;
		var int_min = -2^31;
		var int_value = 2^32;
		if(v>int_max){
			v = v - int_value;
		}else if(v<int_min){
			v = int_value + v;
		}
		return v;
	}
	
	function singleByte(v){
		var byte_max = 2^7 - 1;
		var byte_min = -2^7;
		var byte_value = 2^8;
		if(v>byte_max){
			v = v - byte_value;
		}else if(v<byte_min){
			v = byte_value + v;
		}
		return v;
	}
	
	function getMD5ofStr(inbuf){
		var bytesBuff = str2UTF8(inbuf);
		md5Init();
		md5Update(bytesBuff, bytesBuff.length);
		md5Final();
		digestHexStr = "";
		for (var i = 0; i < 16; i++) {
			digestHexStr += byteHEX(digest[i]);
		}
		return digestHexStr;
	}
	
	var hasInit = false;;
	
	function getMd5(){
		if(hasInit){
			md5Final();
			var digestHexStr = "";
			for (var i = 0; i < 16; i++) {
				digestHexStr += byteHEX(digest[i]);
			}
			return digestHexStr;
		}
		return;
		
	}
	
	
	function md5Init() {
		hasInit = true;
		count[0] = 0;
		count[1] = 0;

		state[0] = 0x67452301;
		state[1] = 0xefcdab89;
		state[2] = 0x98badcfe;
		state[3] = 0x10325476;

		return;
	}
	
	/* F, G, H ,I 是4个基本的MD5函数，在原始的MD5的C实现中，由于它们是
	   简单的位运算，可能出于效率的考虑把它们实现成了宏，在java中，我们把它们
	   　　实现成了private方法，名字保持了原来C中的。 */

	function F(x, y, z) {
		return (x & y) | ((~x) & z);

	}
	function G(x, y, z) {
		return (x & z) | (y & (~z));

	}
	function H(x, y, z) {
		return x ^ y ^ z;
	}

	function I(x, y, z) {
		return y ^ (x | (~z));
	}
	
	function FF(a, b, c, d, x, s, ac) {
		a += F(b, c, d) + x + ac;
		a = (singleInt(a << s)) | ( singleInt(a >>> (32 - s)));
		a += b;
		return a;
	}
	
	function GG(a, b, c, d, x, s, ac) {
		a += G (b, c, d) + x + ac;
		a = (singleInt(a << s)) | (singleInt(a >>> (32 - s)));
		a += b;
		return a;
	}
	
	function HH(a, b, c, d, x, s, ac) {
		a += H (b, c, d) + x + ac;
		a = (singleInt(a << s)) | (singleInt(a >>> (32 - s)));
		a += b;
		return a;
	}
	
	function II(a, b, c, d, x, s,  ac) {
		a += I (b, c, d) + x + ac;
		a = (singleInt(a << s)) | (singleInt(a >>> (32 - s)));
		a += b;
		return a;
	}
	
	
	/*
	  md5Update是MD5的主计算过程，inbuf是要变换的字节串，inputlen是长度，这个
	  函数由getMD5ofStr调用，调用之前需要调用md5init，因此把它设计成private的
	*/
	function md5Update(bytesBuf, length) {
		var i=0, index=0, partLen=0;
		var block = [64];
		index = (count[0] >>> 3) & 0x3F;
		// /* Update number of bits */
		if ((count[0] += (length << 3)) < (length << 3)){
			count[1]++;
		}
		count[1] += (length >>> 29);
		partLen = 64 - index;
		// Transform as many times as possible.
		if (length >= partLen) {
			md5Memcpy(buffer, bytesBuf, index, 0, partLen);
			md5Transform(buffer);
			for (i = partLen; i + 63 < length; i += 64) {
				md5Memcpy(block, bytesBuf, 0, i, 64);
				md5Transform (block);
			}
			index = 0;
		} else{
			i = 0;
		}
		///* Buffer remaining input */
		md5Memcpy(buffer, bytesBuf, index, i, length - i);
	}
	
	/*
	  md5Final整理和填写输出结果
	*/
	function md5Final () {
		var bits = [8];
		var index = 0, padLen = 0;
		///* Save number of bits */
		Encode (bits, count, 8);
		///* Pad out to 56 mod 64.
		index = singleInt((count[0] >>> 3) & 0x3f);
		padLen = (index < 56) ? (56 - index) : (120 - index);
		md5Update (PADDING, padLen);
		///* Append length (before padding) */
		md5Update(bits, 8);
		///* Store state in digest */
		Encode (digest, state, 16);
	}
	
	function md5Memcpy (output, input, outpos, inpos, len)
	{
		for (var i = 0; i < len; i++){
			output[outpos + i] = input[inpos + i];
		}
			
	}
	
	/*
	  md5Transform是MD5核心变换程序，有md5Update调用，block是分块的原始字节
	*/
	function md5Transform (block) {
		var a = state[0], b = state[1], c = state[2], d = state[3];
		var x = [16];

		Decode(x, block, 64);

		/* Round 1 */
		a = FF (a, b, c, d, x[0], S11, 0xd76aa478); /* 1 */
		d = FF (d, a, b, c, x[1], S12, 0xe8c7b756); /* 2 */
		c = FF (c, d, a, b, x[2], S13, 0x242070db); /* 3 */
		b = FF (b, c, d, a, x[3], S14, 0xc1bdceee); /* 4 */
		a = FF (a, b, c, d, x[4], S11, 0xf57c0faf); /* 5 */
		d = FF (d, a, b, c, x[5], S12, 0x4787c62a); /* 6 */
		c = FF (c, d, a, b, x[6], S13, 0xa8304613); /* 7 */
		b = FF (b, c, d, a, x[7], S14, 0xfd469501); /* 8 */
		a = FF (a, b, c, d, x[8], S11, 0x698098d8); /* 9 */
		d = FF (d, a, b, c, x[9], S12, 0x8b44f7af); /* 10 */
		c = FF (c, d, a, b, x[10], S13, 0xffff5bb1); /* 11 */
		b = FF (b, c, d, a, x[11], S14, 0x895cd7be); /* 12 */
		a = FF (a, b, c, d, x[12], S11, 0x6b901122); /* 13 */
		d = FF (d, a, b, c, x[13], S12, 0xfd987193); /* 14 */
		c = FF (c, d, a, b, x[14], S13, 0xa679438e); /* 15 */
		b = FF (b, c, d, a, x[15], S14, 0x49b40821); /* 16 */

		/* Round 2 */
		a = GG (a, b, c, d, x[1], S21, 0xf61e2562); /* 17 */
		d = GG (d, a, b, c, x[6], S22, 0xc040b340); /* 18 */
		c = GG (c, d, a, b, x[11], S23, 0x265e5a51); /* 19 */
		b = GG (b, c, d, a, x[0], S24, 0xe9b6c7aa); /* 20 */
		a = GG (a, b, c, d, x[5], S21, 0xd62f105d); /* 21 */
		d = GG (d, a, b, c, x[10], S22, 0x2441453); /* 22 */
		c = GG (c, d, a, b, x[15], S23, 0xd8a1e681); /* 23 */
		b = GG (b, c, d, a, x[4], S24, 0xe7d3fbc8); /* 24 */
		a = GG (a, b, c, d, x[9], S21, 0x21e1cde6); /* 25 */
		d = GG (d, a, b, c, x[14], S22, 0xc33707d6); /* 26 */
		c = GG (c, d, a, b, x[3], S23, 0xf4d50d87); /* 27 */
		b = GG (b, c, d, a, x[8], S24, 0x455a14ed); /* 28 */
		a = GG (a, b, c, d, x[13], S21, 0xa9e3e905); /* 29 */
		d = GG (d, a, b, c, x[2], S22, 0xfcefa3f8); /* 30 */
		c = GG (c, d, a, b, x[7], S23, 0x676f02d9); /* 31 */
		b = GG (b, c, d, a, x[12], S24, 0x8d2a4c8a); /* 32 */

		/* Round 3 */
		a = HH (a, b, c, d, x[5], S31, 0xfffa3942); /* 33 */
		d = HH (d, a, b, c, x[8], S32, 0x8771f681); /* 34 */
		c = HH (c, d, a, b, x[11], S33, 0x6d9d6122); /* 35 */
		b = HH (b, c, d, a, x[14], S34, 0xfde5380c); /* 36 */
		a = HH (a, b, c, d, x[1], S31, 0xa4beea44); /* 37 */
		d = HH (d, a, b, c, x[4], S32, 0x4bdecfa9); /* 38 */
		c = HH (c, d, a, b, x[7], S33, 0xf6bb4b60); /* 39 */
		b = HH (b, c, d, a, x[10], S34, 0xbebfbc70); /* 40 */
		a = HH (a, b, c, d, x[13], S31, 0x289b7ec6); /* 41 */
		d = HH (d, a, b, c, x[0], S32, 0xeaa127fa); /* 42 */
		c = HH (c, d, a, b, x[3], S33, 0xd4ef3085); /* 43 */
		b = HH (b, c, d, a, x[6], S34, 0x4881d05); /* 44 */
		a = HH (a, b, c, d, x[9], S31, 0xd9d4d039); /* 45 */
		d = HH (d, a, b, c, x[12], S32, 0xe6db99e5); /* 46 */
		c = HH (c, d, a, b, x[15], S33, 0x1fa27cf8); /* 47 */
		b = HH (b, c, d, a, x[2], S34, 0xc4ac5665); /* 48 */

		/* Round 4 */
		a = II (a, b, c, d, x[0], S41, 0xf4292244); /* 49 */
		d = II (d, a, b, c, x[7], S42, 0x432aff97); /* 50 */
		c = II (c, d, a, b, x[14], S43, 0xab9423a7); /* 51 */
		b = II (b, c, d, a, x[5], S44, 0xfc93a039); /* 52 */
		a = II (a, b, c, d, x[12], S41, 0x655b59c3); /* 53 */
		d = II (d, a, b, c, x[3], S42, 0x8f0ccc92); /* 54 */
		c = II (c, d, a, b, x[10], S43, 0xffeff47d); /* 55 */
		b = II (b, c, d, a, x[1], S44, 0x85845dd1); /* 56 */
		a = II (a, b, c, d, x[8], S41, 0x6fa87e4f); /* 57 */
		d = II (d, a, b, c, x[15], S42, 0xfe2ce6e0); /* 58 */
		c = II (c, d, a, b, x[6], S43, 0xa3014314); /* 59 */
		b = II (b, c, d, a, x[13], S44, 0x4e0811a1); /* 60 */
		a = II (a, b, c, d, x[4], S41, 0xf7537e82); /* 61 */
		d = II (d, a, b, c, x[11], S42, 0xbd3af235); /* 62 */
		c = II (c, d, a, b, x[2], S43, 0x2ad7d2bb); /* 63 */
		b = II (b, c, d, a, x[9], S44, 0xeb86d391); /* 64 */

		state[0] = singleInt(singleInt(state[0]) + singleInt(a));
		state[1] = singleInt(singleInt(state[1]) + singleInt(b));
		state[2] = singleInt(singleInt(state[2]) + singleInt(c));
		state[3] = singleInt(singleInt(state[3]) + singleInt(d));
		console.log(singleInt(a)+","+singleInt(b)+","+singleInt(c)+","+singleInt(d));
		console.log(state[0]+","+state[1]+","+state[2]+","+state[3]);
	}
	
	/*Encode把long数组按顺序拆成byte数组，因为java的long类型是64bit的，
	  只拆低32bit，以适应原始C实现的用途
	*/
	function Encode(output, input, len) {
		for (var i=0, j=0; j < len; i++, j += 4) {
			output[j] = input[i] & 0xff;
			output[j + 1] = singleByte((input[i] >>> 8) & 0xff);
			output[j + 2] = singleByte((input[i] >>> 16) & 0xff);
			output[j + 3] = singleByte((input[i] >>> 24) & 0xff);
		}
	}

	/*Decode把byte数组按顺序合成成long数组，因为java的long类型是64bit的，
	  只合成低32bit，高32bit清零，以适应原始C实现的用途
	*/
	function Decode(output, input, len) {
		for (var i=0, j=0; j < len; i++, j += 4){
			var a = b2iu(input[j]);
			var b = b2iu(input[j + 1]) << 8;
			var c = b2iu(input[j + 2]) << 16;
			var d = b2iu(input[j + 3]);
			if(d==128){
				d = (64<<24) + (64 <<24);
			}else{
				d = d << 24;
			}
			output[i] = a + b + c + d;
		}
	}
	
	/*
	  b2iu是我写的一个把byte按照不考虑正负号的原则的＂升位＂程序，因为java没有unsigned运算
	*/
	function b2iu(b) {
		var value = b < 0 ? b & 0x7F + 128 : b;
		console.log(value);
		return value
	}
	
	function byteHEX(ib) {
		var digit = [ '0','1','2','3','4','5','6','7','8','9', 'A','B','C','D','E','F' ];
		var ob = [2];
		ob[0] = digit[(ib >>> 4) & 0X0F];
		ob[1] = digit[ib & 0X0F];
		return ob[0]+ob[1];
	}
	
	
	return {
		getMD5ofStr : getMD5ofStr,
		md5Init : md5Init,
		md5Update : md5Update,
		md5Final : md5Final,
		getMd5 : getMd5
	}
	
};