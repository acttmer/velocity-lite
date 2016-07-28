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

	var _velocity4 = __webpack_require__(6);

	var _velocity5 = __webpack_require__(7);

	var cache = _interopRequireWildcard(_velocity5);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function Velocity(tpl) {
	  this.tpl = tpl;
	}

	Velocity.setConfig = _velocity4.setConfig;
	Velocity.prototype = {
	  render: render,
	  compileCache: getFunction
	};

	module.exports = Velocity;

	function render(data) {
	  var inputData = {};
	  var attrname;
	  for (attrname in _velocity4.config.plugins) {
	    inputData[attrname] = _velocity4.config.plugins[attrname];
	  }
	  for (attrname in data) {
	    inputData[attrname] = data[attrname];
	  }
	  return getFunction(this.tpl)(inputData);
	}

	/**
	 * 获取可执行的函数
	 */
	function getFunction(tpl) {
	  var result = cache.get(tpl);
	  if (!result) {
	    result = (0, _velocity2["default"])(tpl, compile);
	    cache.set(tpl, result);
	  }
	  return result;
	}

	Velocity.register = function () {
	  if (arguments.length == 1) {
	    var pluginArray = arguments[0];
	    for (var key in pluginArray) {
	      _velocity4.config.plugins[key] = pluginArray[key];
	    }
	  } else if (arguments.length == 2) {
	    _velocity4.config.plugins[arguments[0]] = arguments[1];
	  }
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	exports["__esModule"] = true;

	exports["default"] = function (tpl, compileObj) {
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

	    content = content.replace(/@DOUBLE_SLASH/g, '\\').replace(/@SLASH_DOUBLE_QUOTE/g, '"').replace(/@SLASH_SINGLE_QUOTE/g, '\'').replace(/@SLASH_SHARP/g, '#').replace(/@SLASH_DOLLAR/g, '$').replace(/@LEFT_ARROW/g, '<');

	    content = getContent(content);
	    return new Function(content);
	  };
	}

	function getContent(content) {
	  return '\n    var $data = arguments[0];\n    var __ = [];\n    ' + content + '\n    return __.join(\'\');\n  ';
	}

	function preReg(tpl) {
	  tpl = tpl.replace(/\\\\/g, '@DOUBLE_SLASH').replace(/\\"/g, '@SLASH_DOUBLE_QUOTE').replace(/\\'/g, '@SLASH_SINGLE_QUOTE').replace(/\\#/g, '@SLASH_SHARP').replace(/\\\$/g, '@SLASH_DOLLAR');

	  tpl = step1(tpl);
	  tpl = step2(tpl);
	  tpl = step3(tpl);
	  tpl = step4(tpl);
	  tpl = step5(tpl);
	  tpl = step6(tpl);
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

	// 去掉回车, 换行符
	function step5(tpl) {
	  return tpl.replace(/(\r|\n|\r\n)/g, '');
	}

	//替换 </s 或者<1 为 &1
	function step6(tpl) {
	  return tpl.replace(/<([^!\/a-zA-Z])/g, '@LEFT_ARROW$1');
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports["__esModule"] = true;

	exports.config = exports.compile = undefined;
	exports.filterExp = filterExp;
	exports.compileHtml = compileHtml;

	var _velocity = __webpack_require__(4);

	var _velocity2 = _interopRequireDefault(_velocity);

	var _velocity3 = __webpack_require__(5);

	var _velocity4 = _interopRequireDefault(_velocity3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var compile = exports.compile = compileFn(getConfig());
	var config = exports.config = getConfig();

	var varHead = '$data.';
	var keysNeedExpression = ['if', 'elseif', 'set', 'foreach'];

	function compileFn(config) {
	  return function (result) {
	    if (!_velocity2["default"].isArray(result)) {
	      return '__.push(' + compileHtml(result) + ');';
	    } else if (result.length !== 7) {
	      return;
	    }
	    var preBody = result[1];
	    var key = result[2];
	    var express = result[3];
	    var endBody = result[4];
	    var _ = '';

	    if (keysNeedExpression.indexOf(key) >= 0 && express == undefined) {
	      _velocity4["default"].error(key + ' 缺少表达式或 )');
	    }

	    if (preBody) {
	      _ += '__.push(' + compileHtml(preBody) + ');';
	    }
	    var fn = config[key];
	    if (_velocity2["default"].isFunction(fn)) {
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
	    "else": compileElse,
	    "if": compileIf,
	    "break": compileBreak,
	    end: compileEnd
	  };
	}

	function filterExp(express) {
	  var buffer = '';
	  var result = '';
	  var metString = false;
	  var expectedStringSymbol = false;
	  var outOfStringDollar = false;
	  var outOfStringVariableWithBracket = false;
	  var inStringVariable = false;
	  var inStringVariableWithBracket = false;
	  var quietReference = false;

	  for (var i = 0; i < express.length; i++) {
	    var char = express[i];

	    if (metString == true) {
	      if (char == '$') {
	        if (inStringVariable == false) {
	          inStringVariable = true;
	          buffer += '"+';
	          result += buffer;
	          buffer = '';
	        }
	        if (!quietReference) buffer += varHead;
	      } else if (inStringVariable == true && char == '!' && express.charAt(i - 1) == '$') {
	        quietReference = true;
	      } else if (char == '{' && inStringVariable == true) {
	        inStringVariableWithBracket = true;
	      } else if (char == '}' && inStringVariable == true && inStringVariableWithBracket == true) {
	        inStringVariable = false;
	        inStringVariableWithBracket = false;
	        quietReference = false;

	        if (quietReference == true) {
	          result += '(function() {try {return ( ' + varHead + buffer + ' ? ' + varHead + buffer + ' : \'\')} catch(e) {return \'\';}})()';
	        } else {
	          result += buffer;
	        }

	        buffer = '';
	        buffer += '+"';
	      } else if (char == expectedStringSymbol) {
	        if (inStringVariable === true && inStringVariableWithBracket == false) {
	          if (quietReference == true) {
	            result += '(function() {try {return ( ' + varHead + buffer + ' ? ' + varHead + buffer + ' : \'\')} catch(e) {return \'\';}})()';
	          } else {
	            result += buffer;
	          }

	          buffer = '';
	          buffer += '+"';
	          inStringVariable = false;
	          quietReference = false;
	        }

	        expectedStringSymbol = false;
	        metString = false;
	        buffer += char;
	      } else {
	        if (/[^\w.]/g.test(char) && inStringVariable == true && inStringVariableWithBracket == false) {
	          if (quietReference == true) {
	            result += '(function() {try {return ( ' + varHead + buffer + ' ? ' + varHead + buffer + ' : \'\')} catch(e) {return \'\';}})()';
	          } else {
	            result += buffer;
	          }

	          buffer = '';
	          buffer += '+"';
	          inStringVariable = false;
	          quietReference = false;
	        }

	        buffer += char;
	      }
	    } else if (char == '$' && metString == false) {
	      if (!quietReference) buffer += varHead;
	      outOfStringDollar = true;
	    } else if (outOfStringDollar == true && char == '!' && express.charAt(i - 1) == '$') {
	      quietReference = true;
	    } else if (char == '{' && outOfStringDollar == true) {
	      outOfStringVariableWithBracket = true;
	    } else if (char == '}' && outOfStringDollar == true && outOfStringVariableWithBracket == true) {
	      outOfStringDollar == false;
	      outOfStringVariableWithBracket == false;
	      quietReference = false;

	      if (quietReference == true) {
	        result += '(function() {try {return ( ' + varHead + buffer + ' ? ' + varHead + buffer + ' : \'\')} catch(e) {return \'\';}})()';
	      } else {
	        result += buffer;
	      }

	      buffer = '';
	    } else if (char == '"' || char == '\'') {
	      expectedStringSymbol = char;
	      metString = true;
	      buffer += char;
	    } else {
	      if ((char == '=' || char == ' ') && outOfStringVariableWithBracket == false) {
	        if (quietReference == true) {
	          result += '(function() {try {return ( ' + varHead + buffer + ' ? ' + varHead + buffer + ' : \'\')} catch(e) {return \'\';}})()';
	        } else {
	          result += buffer;
	        }
	        buffer = '';
	        outOfStringDollar = false;
	        quietReference = false;
	      }

	      buffer += char;
	    }
	  }
	  result += buffer;
	  return result;
	}

	function compileForeach(exp) {
	  exp = filterExp(exp);
	  var expr = exp.split(/\s+in\s+/);
	  if (!expr || expr.length !== 2) {
	    _velocity4["default"].error('语法解析错误,' + exp);
	  }
	  var id = _velocity2["default"].guid();
	  return varHead + 'foreach = {};\n          ' + varHead + 'foreach.count = 0;\n          ' + varHead + 'foreach.index = -1;\n          var _f' + id + ' = ' + expr[1] + '.length;\n          for(var _v' + id + ' = 0; _v' + id + ' < _f' + id + '; _v' + id + '++) {\n          ' + varHead + 'foreach.count++;\n          ' + varHead + 'foreach.index++;\n          ' + expr[0] + ' = ' + expr[1] + '[_v' + id + '];';
	}

	function compileSet(exp) {
	  exp = filterExp(exp);
	  return exp.indexOf('.') >= 0 ? exp + ';' : exp + ';';
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
	  var inStringVariable = false; // 在字符串里有变量的情况
	  var inStringVariableWithBracket = false; // 在字符串里变量有花括号

	  var buffer = ''; // 缓冲器
	  var result = []; // 处理结果

	  for (var p = 0; p < content.length; p++) {
	    var currentChar = content.charAt(p);

	    if (metString == true) {
	      // 遇到字符串结束符号后，终止字符串状态
	      if (currentChar == expectedStringSymbol) {
	        if (inStringVariable === true && inStringVariableWithBracket == false) {
	          buffer += '+"';
	          inStringVariable = false;
	        }
	        expectedStringSymbol = false;
	        metString = false;
	        buffer += currentChar;
	      } else if (currentChar == '$') {
	        if (inStringVariable == false) {
	          inStringVariable = true;
	          buffer += '"+';
	        }

	        buffer += varHead;
	      } else if (currentChar == '{' && inStringVariable == true) {
	        inStringVariableWithBracket = true;
	      } else if (currentChar == '}' && inStringVariable == true && inStringVariableWithBracket == true) {
	        buffer += '+"';
	        inStringVariable = false;
	        inStringVariableWithBracket = false;
	      } else {
	        if (/[^\w.]/g.test(currentChar) && inStringVariable == true && inStringVariableWithBracket == false) {
	          buffer += '+"';
	          inStringVariable = false;
	        }
	        buffer += currentChar;
	      }
	    } else if (metVariable !== true && currentChar == '$') {
	      metVariable = true;
	      // 遇到变量符号之后将之前的内容视为HTML并清空缓冲器
	      result.push('\'' + buffer.replace(escapeSlashReg, '\\\'') + '\'');
	      buffer = '';
	      buffer += varHead;
	    } else if (metVariable == true && currentChar == '$') {
	      // 什么都不做, 直接跳过这个符号
	      buffer += varHead;
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
	    } else if (metVariable == true && firstMetSymbol !== false && (currentChar == '"' || currentChar == '\'')) {
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
	        buffer = '';
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
	          result.push('(function() {try {return ( (' + buffer + ' || ' + buffer + ' === 0) ? ' + buffer + ' : \'' + buffer.replace('$data.', '$') + '\')} catch(e) {return \'' + buffer.replace('$data.', '$') + '\';}})()');
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
	      _velocity4["default"].error('变量不完整，缺少符号 ' + expectedEndSymbol);
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

	exports["__esModule"] = true;

	exports["default"] = {
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

	Array.prototype.size = function () {
	  return this.length;
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	exports["__esModule"] = true;

	exports["default"] = {
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

	exports["__esModule"] = true;

	exports.setConfig = setConfig;
	var config = exports.config = {
	  isCache: true, //是否开启缓存
	  encodeMode: null, //自定义缓存处理方法
	  cacheMax: 30, //设置缓存最大个数

	  plugins: {} // 插件列表
	};

	function setConfig(param) {
	  for (var key in param) {
	    if (config.hasOwnProperty(key)) {
	      config[key] = param[key];
	    }
	  }
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports["__esModule"] = true;
	
	exports.get = get;
	exports.set = set;
	exports.clear = clear;
	exports.getKey = getKey;

	var _velocity = __webpack_require__(6);

	var _velocity2 = __webpack_require__(4);

	var _velocity3 = _interopRequireDefault(_velocity2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
	  if (!_velocity.config.isCache) return;
	  var key = getKey(tpl);
	  cache.push({
	    key: key,
	    value: value
	  });
	  size = _velocity.config.cacheMax || size;
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
	  var encodeMode = _velocity.config.encodeMode;
	  var key = '';
	  if (encodeMode && _velocity3["default"].isFunction(encodeMode)) {
	    key = encodeMode(tpl);
	  } else {
	    key = tpl.replace(/\s|\r|\n|\r\n*/mg, '');
	  }
	  return key;
	}

/***/ }
/******/ ]);