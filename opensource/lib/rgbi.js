
/**
 * A simple library for using a 4 bit color palette: rgbi.
 * Useful for shaving bytes of data off of 
 */

/**
 * @typedef RGB24
 * @property {number} r A number from 0 to 255.
 * @property {number} g A number from 0 to 255.
 * @property {number} b A number from 0 to 255.
 */
/**
 * @typedef RGBI
 * @property {number} r A number from 0 to 1.
 * @property {number} g A number from 0 to 1.
 * @property {number} b A number from 0 to 1.
 * @property {number} i A number from 0 to 1.
 */

var RGBI = {};

(function(){
	function interpretRgbiArgs(r,g,b,i){
		if(arguments.length == 1){
			if(typeof r == "object"){
				i = r.i || 0;
				b = r.b || 0;
				g = r.g || 0;
				r = r.r || 0;
			}
			else if(typeof r == "number"){
				i = r & 1 ? 1 : 0;
				g = r & 2 ? 1 : 0;
				b = r & 4 ? 1 : 0;
				r = r & 8 ? 1 : 0;
			}
			else if(!isNaN("0x" + r)){
				return interpretRgbiArgs(parseInt("0x" + r));
			}
			else{
				r = 0;
				g = 0;
				b = 0;
				i = 0;
			}
		}
		else{
			r = r ? 1 : 0;
			g = g ? 1 : 0;
			b = b ? 1 : 0;
			i = i ? 1 : 0;
		}
		return {
			r: r,
			g: g,
			b: b,
			i: i
		};
	}

	/**
	 * Converts rgbi to a 4-bit integer. 
	 * If only one param is passed in, it will be interpreted as a hex rgbi code if it's a string, or a 4-bit rgbi int code if it's a number.
	 * @param {number|string|RGBI} r 
	 * @param {number} g 
	 * @param {number} b 
	 * @param {number} i 
	 * @returns {number} A 4 bit integer representing the color.
	 */
	RGBI.toInt = function(r,g,b,i){
		let code = interpretRgbiArgs.apply(this, arguments);
		return code.i | code.b<1 | code.g<2 | code.r<3;
	}

		/**
	 * Converts rgbi to a hex char from 0 to f. 
	 * If only one param is passed in, it will be interpreted as a hex rgbi code if it's a string, or a 4-bit rgbi int code if it's a number.
	 * @param {number|string|RGBI} r 
	 * @param {number} g 
	 * @param {number} b 
	 * @param {number} i 
	 * @returns {string} A hex char representing the color.
	 */
	RGBI.toHexChar = function(r,g,b,i){
		let code = interpretRgbiArgs.apply(this, arguments);
		return (code.i + code.b<1 + code.g<2 + code.r<3).toString(16);
	}

	/**
	 * Converts rgbi to an object containing 8-bit r, g, and b data. 
	 * If only one param is passed in, it will be interpreted as a hex rgbi code if it's a string, or a 4-bit rgbi int code if it's a number.
	 * @param {number|string|RGBI} r 
	 * @param {number} g 
	 * @param {number} b 
	 * @param {number} i 
	 * @returns {RGB24} RGB data object.
	 */
	RGBI.toRgb256 = function(r,g,b,i){
		let code = interpretRgbiArgs.apply(this, arguments);
		let res = {r: 0, g: 0, b: 0};
		if(!code.r && !code.g && !code.b){
			if(i){
				res.r = 103;
				res.g = 103;
				res.b = 103;
			}
		}
		else{
			res.r = (code.r * 127) * (code.i + 1)
			res.g = (code.g * 127) * (code.i + 1)
			res.b = (code.b * 127) * (code.i + 1)
		}
		return res;
	}

	/**
	 * Converts rgbi to a CSS property value. 
	 * If only one param is passed in, it will be interpreted as a hex rgbi code if it's a string, or a 4-bit rgbi int code if it's a number.
	 * @param {number|string|RGBI} r 
	 * @param {number} g 
	 * @param {number} b 
	 * @param {number} i 
	 * @returns {string} CSS property value.
	 */
	RGBI.toCss = function(r,g,b,i){
		let color256 = RGBI.toRgb256.apply(this, arguments);
		return "rgb("+color256.r+","+color256.g+","+color256.b+")"
	}

	/**
	 * Converts rgbi to a 24 bit color integer. 
	 * If only one param is passed in, it will be interpreted as a hex rgbi code if it's a string, or a 4-bit rgbi int code if it's a number.
	 * @param {number|string|RGBI} r 
	 * @param {number} g 
	 * @param {number} b 
	 * @param {number} i 
	 * @returns {number} 24 bit color integer.
	 */
	RGBI.toInt24 = function(r,g,b,i){
		let color256 = RGBI.toRgb256.apply(this, arguments);
		return color256.b + color256.g*256 + color256.r*256*256;
	}

	/**
	 * Simplifies 24 bit color into a 4 bit rgbi integer.
	 * @param {number|string|RGBI} r 
	 * @param {number} g 
	 * @param {number} b 
	 * @returns {number} The 4 bit rgbi number. Pass it into RGBI.rbgiToHexChar to get a single char from 0-f.
	 */
	RGBI.fromRgb256 = function(r,g,b){
		//Color values between 0-255.

		r = Math.round(r / 128);
		g = Math.round(g / 128);
		b = Math.round(b / 128);
		//Color values 0, 1, or 2

		let i = 0;
		if(r == 2 || g == 2 || b == 2) {
			i = 1;
			r = Math.max(0, r - 1);
			g = Math.max(0, g - 1);
			b = Math.max(0, b - 1);
		}
		return RGBI.toInt(r,g,b,i);
	}
})();