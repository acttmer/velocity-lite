/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["Velocity"] = __webpack_require__(1);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _velocity = __webpack_require__(2);

	var _velocity2 = _interopRequireDefault(_velocity);

	var _velocity3 = __webpack_require__(3);

	var compile = _interopRequireWildcard(_velocity3);

	var _velocity4 = __webpack_require__(4);

	var _velocity5 = _interopRequireDefault(_velocity4);

	var _velocity6 = __webpack_require__(6);

	var _velocity7 = __webpack_require__(7);

	var cache = _interopRequireWildcard(_velocity7);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function Velocity(tpl) {
	  this.tpl = tpl;
	}

	module.exports = Velocity;

	Velocity.config = _velocity6.config;
	Velocity.prototype = {
	  render: render,
	  compileCache: getFunction
	};

	Velocity.register = function () {
	  if (arguments.length == 1) {
	    var pluginArray = arguments[0];
	    for (var key in pluginArray) {
	      _velocity6.params.plugins[key] = pluginArray[key];
	    }
	  } else if (arguments.length == 2) {
	    var key = arguments[0];
	    var methods = arguments[1];
	    _velocity6.params.plugins[key] = methods;
	  }
	};

	Velocity.config = _velocity6.config;

	function render(data) {
	  return getFunction(this.tpl)(data, _velocity6.params.plugins);
	}

	/**
	 * 获取可执行的函数
	 */
	function getFunction(tpl) {
	  if (_velocity6.params.encodeMode && _velocity5.default.isFunction(_velocity6.params.encodeMode)) {
	    tpl = _velocity6.params.encodeMode(tpl);
	  }
	  var result = cache.get(tpl);
	  if (!result) {
	    result = (0, _velocity2.default)(tpl, compile);
	    if (_velocity6.params.isCache) {
	      cache.set(tpl, result);
	    }
	  }
	  return result;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports.default = function (tpl, compileObj) {
	  tpl = preReg(tpl);
	  return reg(tpl, Object.keys(compileObj.config).join('|'))(compileObj.compile);
	};

	exports.reg = reg;
	exports.preReg = preReg;
	exports.step1 = step1;
	exports.step2 = step2;
	exports.step3 = step3;
	exports.step4 = step4;
	exports.step5 = step5;
	exports.step6 = step6;
	exports.step7 = step7;
	function reg(tpl, token) {
	  var reg = new RegExp('(.*?)(?=#[' + token + '])#(' + token + ')(?:\\s*\\(([^<#]*)\\))?([^#]*)', 'g');

	  return function (fn) {
	    var content = '';
	    tpl.replace(reg, function () {
	      content += fn(Array.prototype.slice.call(arguments)); // ES6: Array.from(arguments)
	    });
	    if (!content && tpl) {
	      content += fn(tpl);
	    }
	    content = content.replace(/@DOUBLE_SLASH/g, '\\').replace(/@SLASH_SHARP/g, '#').replace(/@SLASH_DOLLAR/g, '$');
	    content = getContent(content);
	    return new Function(content);
	  };
	}

	function getContent(content) {
	  return '\n    with(arguments[0]) {\n      with(arguments[1]) {\n        var __ = [];\n        ' + content + '\n        return __.join(\'\');\n      }\n    };\n  ';
	}

	function preReg(tpl) {
	  tpl = tpl.replace(/\\\\/g, '@DOUBLE_SLASH').replace(/\\#/g, '@SLASH_SHARP').replace(/\\\$/g, '@SLASH_DOLLAR');
	  tpl = step1(tpl);
	  tpl = step2(tpl);
	  tpl = step3(tpl);
	  tpl = step4(tpl);
	  tpl = step5(tpl);
	  //tpl = step6(tpl);
	  //tpl = step7(tpl);
	  return tpl;
	}

	function step1(tpl) {
	  return tpl.replace(/^(\s*(\[\[)?\s*)/g, '');
	}

	// 去掉尾部 空格]]空格
	function step2(tpl) {
	  return tpl.replace(/(\s*(\]\])?\s*)$/, '');
	}

	// 去掉 { } 括号
	function step3(tpl) {
	  return tpl.replace(/#\s*\{([^#]*)\}/g, '#$1 ');
	}

	//去掉注释 ##
	function step4(tpl) {
	  return tpl.replace(/##.+?(?=(\n|\r|\r\n))/g, '');
	}

	// 去掉回车, 换行符，去掉(前的空格
	function step5(tpl) {
	  return tpl.replace(/(\r|\n|\r\n)/g, '');
	  //return tpl.replace(/(\r|\n|\r\n|\s+(?=\())/g, '');
	}

	// 去掉 < 两边的空格
	function step6(tpl) {
	  return tpl.replace(/\s*<\s*/g, '<');
	}

	//替换 </s 或者<1 为 &1
	function step7(tpl) {
	  return tpl.replace(/<([^!\/a-zA-Z])/g, '&lt$1');
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.config = exports.compile = undefined;
	exports.filterExp = filterExp;
	exports.compileHtml = compileHtml;

	var _velocity = __webpack_require__(4);

	var _velocity2 = _interopRequireDefault(_velocity);

	var _velocity3 = __webpack_require__(5);

	var _velocity4 = _interopRequireDefault(_velocity3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var compile = exports.compile = compileFn(getConfig());
	var config = exports.config = getConfig();

	function compileFn(config) {
	  return function (result) {
	    if (!_velocity2.default.isArray(result)) {
	      return '__.push(' + compileHtml(result) + ');';
	    } else if (result.length !== 7) {
	      return;
	    }
	    var preBody = result[1];
	    var key = result[2];
	    var express = result[3];
	    var endBody = result[4];
	    var _ = '';
	    if (preBody) {
	      _ += '__.push(' + compileHtml(preBody) + ');';
	    }
	    var fn = config[key];
	    if (_velocity2.default.isFunction(fn)) {
	      _ += fn(express);
	    }
	    if (endBody) {
	      _ += '__.push(' + compileHtml(endBody) + ');';
	    }
	    return _;
	  };
	}

	function getConfig() {
	  return {
	    foreach: compileForeach,
	    set: compileSet,
	    elseif: compileElseIf,
	    else: compileElse,
	    if: compileIf,
	    break: compileBreak,
	    end: compileEnd
	  };
	}

	function filterExp(express) {
	  if (!filterExp.regex) {
	    filterExp.regex = /\${?([^{}}$]*)}?/g;
	  }
	  return express ? express.replace(filterExp.regex, '$1') : express;
	}

	function compileForeach(exp) {
	  exp = filterExp(exp);
	  var expr = exp.split(/\s+in\s+/);
	  if (!expr || expr.length !== 2) {
	    _velocity4.default.error('语法解析错误,' + exp);
	  }
	  var id = _velocity2.default.guid();
	  return 'var foreach = {};' + 'foreach.count = 0;' + 'foreach.index = -1;' + ('for(var _v' + id + ' in ' + expr[1] + ') {') + 'foreach.count++;' + 'foreach.index++;' + ('var ' + expr[0] + ' = ' + expr[1] + '[_v' + id + '];');
	}

	function compileSet(exp) {
	  exp = filterExp(exp);
	  return exp.indexOf('.') >= 0 ? exp + ';' : 'var ' + exp + ';';
	  // ES6: exp.includes('.')
	}

	function compileElseIf(exp) {
	  exp = filterExp(exp);
	  return '} else if (' + exp + ') {';
	}

	function compileElse() {
	  return '} else {';
	}

	function compileIf(exp) {
	  exp = filterExp(exp);
	  return 'if(' + exp + ') {';
	}

	function compileBreak() {
	  return 'break;';
	}

	function compileEnd() {
	  return '}';
	}

	// 新版变量识别编译 (仍需bug测试)
	function compileHtml(content) {
	  var escapeSlashReg = /\'/g;

	  var metVariable = false; // 是否撞到变量
	  var metString = false; // 是否撞到字符串
	  var expectedStringSymbol = false; // 字符串开始和结束符号
	  var quietReference = false; // 是否是安静解析
	  var firstMetSymbol = false; // 第一次开始当做方法或者数组对象解析的符号
	  var expectedEndSymbol = false; // 对应开始符号的结束符号
	  var firstMetSymbolRepeatCount = 0; // 开始符号重复的次数(用于统计变量是否正确完结)

	  var buffer = ''; // 缓冲器
	  var result = []; // 处理结果

	  for (var p = 0; p < content.length; p++) {
	    var currentChar = content.charAt(p);

	    if (metString == true) {
	      // 遇到字符串结束符号后，终止字符串状态
	      if (currentChar == expectedStringSymbol) {
	        expectedStringSymbol = false;
	        metString = false;
	        buffer += currentChar;
	      } else {
	        buffer += currentChar;
	      }
	    } else if (metVariable !== true && currentChar == '$') {
	      metVariable = true;
	      // 遇到变量符号之后将之前的内容视为HTML并清空缓冲器
	      result.push('\'' + buffer.replace(escapeSlashReg, '\\\'') + '\'');
	      buffer = '';
	    } else if (metVariable == true && currentChar == '$') {
	      // 什么都不做, 直接跳过这个符号

	    } else if (metVariable == true && currentChar == '!' && content.charAt(p - 1) == '$') {
	      quietReference = true;
	    } else if (metVariable == true && firstMetSymbol === false && (currentChar == '[' || currentChar == '(' || currentChar == '{')) {
	      /* 条件成立下，设定对应的开始结束符号 */
	      if (currentChar == '[') {
	        firstMetSymbol = '[';
	        expectedEndSymbol = ']';
	        buffer += currentChar;
	      } else if (currentChar == '(') {
	        firstMetSymbol = '(';
	        expectedEndSymbol = ')';
	        buffer += currentChar;
	      } else if (currentChar == '{') {
	        // 这个符号是限定符，所以不加入缓冲器
	        firstMetSymbol = '{';
	        expectedEndSymbol = '}';
	      }
	    } else if (metVariable == true && firstMetSymbol !== false && (currentChar == '"' || currentChar == "'")) {
	      // 字符串处理
	      metString = true;
	      expectedStringSymbol = currentChar;
	      buffer += currentChar; // 虽然是字符串，但最终解析为js所以不能去掉那个引号
	    } else if (metVariable == true && firstMetSymbol !== false && currentChar == firstMetSymbol) {
	      // 如果又遇到了和起始符号相同的符号，增加出现次数变量
	      firstMetSymbolRepeatCount++;
	      buffer += currentChar;
	    } else if (metVariable == true && firstMetSymbol !== false && currentChar == expectedEndSymbol) {

	      // 如果遇到结束符号则判断是否所有起始和结束符号都已配对
	      if (firstMetSymbolRepeatCount == 0) {
	        if (expectedEndSymbol !== '}') {
	          buffer += currentChar;
	        } else if (buffer.trim() == '') {
	          console.error('变量定义为空');
	          return result;
	        }

	        if (quietReference == true) {
	          result.push('(function() {try {return ( ' + buffer + ' ? ' + buffer + ' : \'\')} catch(e) {return \'\';}})()');
	        } else {
	          result.push('(' + buffer + ')');
	        }

	        // 关闭所有变量开关
	        metVariable = false;
	        quietReference = false;
	        firstMetSymbol = false;
	        expectedEndSymbol = false;

	        // 清空缓存器
	        buffer = "";
	      } else {
	        // 否则减少出现起始符号的次数
	        firstMetSymbolRepeatCount--;
	        buffer += currentChar;
	      }
	    } else if (/[\w.]/.test(currentChar)) {
	      // 如果符号是 0-9 a-z A-Z _ . 的话，则不视为特殊符号
	      buffer += currentChar;
	    } else if (metVariable == true && firstMetSymbol == false && currentChar == ' ' && buffer.trim() == '') {

	      // 如果遇到空格，但是变量又为空的话，视为输出$或$!字符，但如果加了 { 是必须要报错的
	      if (quietReference == false) {
	        result.push('\'$ \'');
	      } else {
	        result.push('\'$! \'');
	      }

	      metVariable = false;
	      quietReference = false;
	    } else {

	      // 遇到其他符号，则判断是不是在复杂变量状态(比如方法调用)，如果不是，则输出之前的变量，否则继续缓冲
	      if (metVariable == true && firstMetSymbol == false) {
	        if (buffer.trim() != '') {
	          result.push('(' + buffer + ')');
	        } else {
	          if (quietReference == false) {
	            result.push('\'$ \'');
	          } else {
	            result.push('\'$! \'');
	          }
	        }

	        metVariable = false;
	        quietReference = false;
	        buffer = currentChar;
	      } else {
	        buffer += currentChar;
	      }
	    }
	  }

	  // 遭遇行尾的处理，原理同上方行内处理
	  if (metVariable == true) {
	    if (firstMetSymbol !== false) {
	      console.error('变量不完整，缺少符号 ' + expectedEndSymbol);
	      return result;
	    } else {
	      if (buffer.trim() != '') {
	        if (quietReference == true) {
	          result.push('(function() {try {return ( ' + buffer + ' ? ' + buffer + ' : \'\')} catch(e) {return \'\';}})()');
	        } else {
	          result.push('(' + buffer + ')');
	        }
	      } else {
	        if (quietReference == false) {
	          result.push('\'$ \'');
	        } else {
	          result.push('\'$! \'');
	        }
	      }
	    }
	  } else {
	    // 作为HTML输出
	    result.push('\'' + buffer.replace(escapeSlashReg, '\\\'') + '\'');
	  }

	  // 最终返回
	  return result;
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  guid: guid,
	  isArray: isArray,
	  isFunction: isFunction
	};


	function guid() {
	  guid.number = guid.number >= 0 ? guid.number + 1 : 0;
	  return guid.number;
	}

	function isArray(obj) {
	  return Object.prototype.toString.call(obj) === '[object Array]';
	}

	function isFunction(obj) {
	  return Object.prototype.toString.call(obj) === '[object Function]';
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  info: function info(msg) {
	    console.log(msg);
	  },
	  error: function error(msg) {
	    throw new Error("velocity error :" + msg);
	  }
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.config = config;
	var params = exports.params = {
	  isCache: true, //是否开启缓存
	  encodeMode: null, //自定义缓存key编码方式
	  cacheMax: 30, //设置缓存最大个数
	  plugins: {} // 插件列表
	};

	function config(opt) {
	  for (var i in opt) {
	    params[i] = opt[i];
	  }
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.get = get;
	exports.set = set;
	exports.clear = clear;
	exports.getKey = getKey;

	var _velocity = __webpack_require__(6);

	var cache = [];
	var size = 20; //统计缓存个数

	// 获取缓存
	function get(tpl) {
	  var key = getKey(tpl);
	  var data = cache.filter(function (item) {
	    return item.key === key;
	  });
	  return data.length ? data[0].value : null;
	}

	// 设置缓存
	function set(tpl, value) {
	  var key = getKey(tpl);
	  cache.push({
	    key: key,
	    value: value
	  });
	  size = _velocity.params.cacheMax || size;
	  if (cache.length > size) {
	    cache = cache.slice(-size);
	  }
	}

	// 清空缓存
	function clear() {
	  cache = [];
	}

	// 生成key
	function getKey(tpl) {
	  return tpl.replace(/\s|\r|\n|\r\n*/mg, '');
	}

/***/ }
/******/ ]);