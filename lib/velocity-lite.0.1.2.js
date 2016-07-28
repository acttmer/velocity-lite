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

	var _config = __webpack_require__(2);

	var _parse = __webpack_require__(3);

	var _parse2 = _interopRequireDefault(_parse);

	var _compile = __webpack_require__(5);

	var _compile2 = _interopRequireDefault(_compile);

	var _cache = __webpack_require__(6);

	var _cache2 = _interopRequireDefault(_cache);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function Velocity(template) {
	  this.template = template;
	}

	module.exports = Velocity;

	Velocity.prototype = {
	  render: render
	};

	/* 默认插件 */
	Velocity.plugins = {};

	/* 注册插件静态方法 */
	Velocity.register = function (keys, methods) {
	  if (keys.constructor == String) {
	    var key = keys;
	    Velocity.plugins[key] = methods;
	  } else {
	    for (var key in keys) {
	      Velocity.plugins[key] = keys[key];
	    }
	  }
	};

	/* 注册配置静态方法 */
	Velocity.config = _config.setConfig;

	/* 主渲染函数 */
	function render(data) {
	  // 获得执行函数
	  var fn = getVM(this.template);

	  // 如果有插件，则遍历导入数据
	  if (Velocity.plugins !== {}) {
	    for (var key in Velocity.plugins) {
	      data[key] = Velocity.plugins[key];
	    }
	  }

	  return fn(data);
	}

	/* 生成虚拟机 */
	function getVM(template) {
	  var key = _cache2.default.getKey(template);
	  var ramCache = _cache2.default.getRam(key);
	  var fn;

	  if (ramCache === null) {
	    var sessionCache = _cache2.default.getSession(key);
	    if (_config.configs.sessionCache && sessionCache !== null) {
	      fn = new Function(sessionCache);
	    } else {
	      var jsCode = (0, _compile2.default)((0, _parse2.default)(template), template);

	      fn = new Function(jsCode);

	      if (_config.configs.sessionCache) {
	        _cache2.default.setSession(key, jsCode);
	      }
	    }

	    _cache2.default.setRam(key, fn);
	  } else {
	    fn = ramCache;
	  }

	  return fn;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setConfig = setConfig;
	/* 导出变量 */
	var configs = exports.configs = {
	  undefinedOutput: false, // 如果变量不存在，是否原样输出
	  sessionCache: false, // 是否启用 sessionStorage 作为缓存实现
	  exactErrorLine: false // 获取准确的错误行数 (指在HTML文件里的行数, 需 Jquery 或 Zepto 支持)
	};

	function setConfig(params) {
	  for (var key in params) {
	    configs[key] = params[key];
	  }
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _error = __webpack_require__(4);

	var _error2 = _interopRequireDefault(_error);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = parse;

	/* 关键字列表 */

	var keywords = ['if', 'else', 'elseif', 'end', 'set', 'foreach', 'break'];
	var keywordsNeedSublayer = ['if', 'elseif', 'set', 'foreach'];

	var TYPE_HTML = 1,
	    // HTML 类型
	TYPE_SYNTAX = 2,
	    // 语法类型
	TYPE_DIRECTIVE = 3,
	    // 指令类型
	TYPE_VARIABLE = 4,
	    // 变量类型
	TYPE_VARIABLE_QR = 5,
	    // 变量类型
	TYPE_STRING = 6,
	    // 字符串类型
	TYPE_STRING_CONTENT = 7; // 字符串内容类型

	/* 定义为全局变量避免递归传参性能消耗 */
	var words, // 词表
	symbols, // 符号表
	symbolCount; // 符号表长度

	var res; // 预先声明以缩减体积

	/* 解析器主循环 */
	function parse(template) {

	  words = template.split(/[^\w\u4E00-\u9FA5]/g), // 词表
	  symbols = template.replace(/[\w|\u4E00-\u9FA5]/g, '').split(''); // 符号表
	  symbolCount = symbols.length;

	  var parseStack = [];

	  // 第一个单词一定是 HTML 内容
	  parseStack.push({ type: TYPE_HTML, val: words.shift() });

	  for (var i = 0; i < symbolCount; i++) {
	    var hasNext = i < symbolCount - 1 ? true : false; // 是否存在下一项

	    if (symbols[i] == '$') {
	      /* 如遇变量，调用递归变量解析器，根据返回结果进行操作 */
	      res = variableHandler(i);

	      parseStack.push(res.vModel);
	      if (res.ins) parseStack.push({ type: TYPE_HTML, val: words[res.lps] });
	      i = res.lps;
	    } else if (symbols[i] == '#') {
	      if (hasNext && symbols[i + 1] == '#' && words[i] == '') {
	        /* 单行注释的情况 */
	        i = commentHandler(i + 1);
	      } else if (hasNext && symbols[i + 1] == '*' && words[i] == '') {
	        /* 多行注释的情况 */
	        i = multilineCommentHandler(i + 1);
	      } else if (symbols.slice(i, i + 3).join('') == '#[[' && words.slice(i, i + 2).join('') == '') {
	        /* 不进行转义的情况 */
	        res = pureHtmlHandler(i + 2);

	        parseStack.push(res.hModel);
	        i = res.lps;
	      } else {
	        /* 指令处理的情况 */
	        res = directiveHandler(i);

	        parseStack.push(res.dModel);
	        if (res.ins) parseStack.push({ type: TYPE_HTML, val: words[res.lps] });
	        i = res.lps;
	      }
	    } else if (symbols[i] == '\\' && hasNext && words[i] == '') {
	      /* 遭遇转义字符的情况 */
	      parseStack.push({ type: TYPE_HTML, val: symbols[i + 1] + words[i + 1] });
	      i++;
	    } else if (symbols[i] == '\n') {
	      /* 所有 HTML 内容里的 \n 应被无视 */
	      parseStack.push({ type: TYPE_HTML, val: words[i] });
	    } else {
	      /* 其他特殊符号的情况 */
	      parseStack.push({ type: TYPE_HTML, val: symbols[i] + words[i] });
	    }
	  }

	  // 返回编译资源
	  return { parseStack: parseStack, symbols: symbols, words: words };
	}

	/* 纯html文本解析器 */
	function pureHtmlHandler(pos) {
	  var hModel = { type: 'html', val: words[pos] };

	  for (var j = pos + 1; j < symbolCount; j++) {
	    if (symbols[j] == ']' && symbols.slice(j, j + 3).join('') == ']]#' && words.slice(j, j + 2).join('') == '') {
	      hModel.val += words[j + 2];
	      return {
	        hModel: hModel,
	        lps: j + 2
	      };
	    } else if (symbols[j] == '\n') {
	      // 所有 HTML 内容里的 \n 应被无视
	      hModel.val += words[j];
	    } else {
	      hModel.val += symbols[j] + words[j];
	    }
	  }

	  throwError('防止转义没有结束标识', 'EOF');
	}

	/* 注释解析器 */
	function commentHandler(pos) {
	  for (var j = pos + 1; j < symbolCount; j++) {
	    if (symbols[j] == '\n') {
	      return j; // 返回主循环位置
	    }
	  }
	  return j;
	}

	/* 多行注释解析器 */
	function multilineCommentHandler(pos) {
	  for (var j = pos + 1; j < symbolCount; j++) {
	    if (symbols[j] == '*' && j < symbolCount - 1 && symbols[j + 1] == '#') {
	      return j + 1; // 返回主循环位置
	    }
	  }

	  throwError('多行注释没有结束标识', 'EOF');
	}

	/* 用于指令解析的处理器 */
	function directiveHandler(pos) {
	  var dModel = {
	    type: TYPE_DIRECTIVE,
	    val: words[pos],
	    sublayer: [],
	    begin: pos
	  };

	  var sublayerBegin = false; // 是否有表达式层
	  var beginBracketRepeatTimes = 0; // 起始标识括号重复出现次数

	  for (var j = pos + 1; j < symbolCount; j++) {
	    if (!sublayerBegin && symbols[j] == '(') {
	      /* 表达式开始的情况 */
	      dModel.sublayer.push({ type: TYPE_SYNTAX, val: words[j] });
	      sublayerBegin = true;
	    } else if (sublayerBegin && symbols[j] == '(') {
	      /* 遭遇表达式开始标识的情况 */
	      dModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] + words[j] });
	      beginBracketRepeatTimes++;
	    } else if (sublayerBegin && symbols[j] == ')') {
	      /* 遭遇表达式结束标识的情况 */
	      if (beginBracketRepeatTimes == 0) {
	        return {
	          dModel: dModel,
	          lps: j, // 返回主循环位置
	          ins: true // 插入该符号后面的单词
	        };
	      } else {
	        dModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] + words[j] });
	        beginBracketRepeatTimes--;
	      }
	    } else if (sublayerBegin && symbols[j] == '$') {
	      /* 遭遇变量的情况 */
	      res = variableHandler(j);

	      dModel.sublayer.push(res.vModel);
	      j = res.lps;
	    } else if (sublayerBegin && (symbols[j] == '"' || symbols[j] == '\'')) {
	      /* 遭遇字符串的情况 */
	      res = stringHandler(j);

	      dModel.sublayer.push(res.sModel);
	      j = res.lps;
	    } else if (sublayerBegin && symbols[j] == '\n') {
	      /* 所有表达式里的换行符应该被无视 */
	      dModel.sublayer.push({ type: TYPE_SYNTAX, val: words[j] });
	    } else {
	      if (!sublayerBegin) {
	        /* 如果搜索没发现表达式，去查询一下是否需要 */
	        if (keywordsNeedSublayer.indexOf(words[pos]) >= 0) {
	          if (symbols[j] == ' ') {
	            continue;
	          } else {
	            throwError('指令 ' + dModel.val + ' 缺少 (', j);
	          }
	        }

	        if (keywords.indexOf(dModel.val) == -1) {
	          throwError('指令 ' + dModel.val + ' 不存在', j);
	        }

	        dModel.sublayer = false;
	        return {
	          dModel: dModel,
	          lps: j - 1, // 返回主循环位置
	          ins: false // 不插入该符号后面的单词
	        };
	      } else {
	        if (symbols[j] == '#') {
	          throwError('指令 ' + dModel.val + ' 未结束并遭遇另一个指令符号 #', dModel.begin);
	        }

	        dModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] + words[j] });
	      }
	    }
	  }

	  /* 到了结尾的情况 */
	  if (!sublayerBegin) {
	    dModel.sublayer = false;
	    return {
	      dModel: dModel,
	      lps: j - 1 // 返回主循环位置
	    };
	  } else {
	    throwError('指令 ' + dModel.val + ' 没有结束', dModel.begin);
	  }
	}

	/* 用于字符串解析的处理器 */
	function stringHandler(pos) {
	  /* 此处构建复杂模型用于支持字符串内变量解析 */
	  var sModel = { type: TYPE_STRING, sublayer: [{ type: TYPE_STRING_CONTENT, val: words[pos] }], begin: pos };
	  var expect = symbols[pos]; // 记录下字符串起始符号 (双引号或单引号)

	  for (var j = pos + 1; j < symbolCount; j++) {
	    if (symbols[j] == '\\') {
	      /* 遭遇字符转义的情况 */
	      sModel.sublayer.push({ type: TYPE_STRING_CONTENT, val: symbols[j + 1] + words[j + 1] });
	      j++;
	    } else if (symbols[j] == expect) {
	      return {
	        sModel: sModel,
	        lps: j // 返回主循环位置
	      };
	    } else if (symbols[j] == '$') {
	      /* 遭遇变量的情况 */
	      res = variableHandler(j);

	      sModel.sublayer.push(res.vModel);
	      j = res.lps;
	    } else if (symbols[j] == '\n') {
	      /* 遭遇换行符需报错 */
	      throwError('字符串 \'' + sModel.sublayer[0].val + '\' 没有结束', sModel.begin);
	    } else {
	      sModel.sublayer.push({ type: TYPE_STRING_CONTENT, val: symbols[j] + words[j] });
	    }
	  }

	  throwError('字符串 \'' + sModel.sublayer[0].val + '\' 没有结束', sModel.begin);
	}

	/* 用于变量解析的递归处理器 */
	function variableHandler(pos) {

	  var vModel = {
	    type: TYPE_VARIABLE,
	    sublayer: [{ type: TYPE_SYNTAX, val: words[pos] }],
	    begin: pos
	  };

	  var complexVariableBeginToken = false; // 复杂变量开始标识 如 $item[0] 或 $item.getMyName()
	  var complexVariableExpectedToken = false; // 复杂变量结束标识
	  var complexVariableTokenRepeatTimes = 0; // 复杂变量开始标识在变量中出现的次数

	  for (var j = pos + 1; j < symbolCount; j++) {

	    if (symbols[j] == '$') {
	      /* 再次遭遇变量的情况 */
	      res = variableHandler(j);

	      vModel.sublayer.push(res.vModel);
	      j = res.lps;
	    } else if (symbols[j] == '!') {
	      /* Quiet Reference 的情况 */
	      if (!complexVariableBeginToken) {
	        vModel.type = TYPE_VARIABLE_QR;
	        vModel.sublayer.push({ type: TYPE_SYNTAX, val: words[j] });
	      } else {
	        vModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] + words[j] });
	      }
	    } else if (complexVariableBeginToken && (symbols[j] == '"' || symbols[j] == '\'')) {
	      /* 字符串的情况 */
	      res = stringHandler(j);

	      vModel.sublayer.push(res.sModel);
	      j = res.lps;
	    } else if (symbols[j] == '.') {
	      /* 在变量中的遇到 . 按正常语法处理 */
	      vModel.sublayer.push({ type: TYPE_SYNTAX, val: '.' + words[j] });
	    } else if (!complexVariableBeginToken && (symbols[j] == '(' || symbols[j] == '{' || symbols[j] == '[')) {
	      /* 各种起始符号的对应结束符号 */
	      complexVariableBeginToken = symbols[j];

	      if (complexVariableBeginToken == '(') complexVariableExpectedToken = ')';else if (complexVariableBeginToken == '[') complexVariableExpectedToken = ']';else if (complexVariableBeginToken == '{') complexVariableExpectedToken = '}';

	      /* 对 } 符号特殊化处理 */
	      vModel.sublayer.push({ type: TYPE_SYNTAX, val: (complexVariableBeginToken !== '{' ? complexVariableBeginToken : '') + words[j] });
	    } else if (symbols[j] === complexVariableBeginToken) {
	      /* 变量中再次出现起始符号则增加次数统计 */
	      complexVariableTokenRepeatTimes++;
	      vModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] + words[j] });
	    } else if (symbols[j] === complexVariableExpectedToken) {
	      /* 判断是否变量已经结束 */
	      if (complexVariableTokenRepeatTimes == 0) {
	        if (complexVariableExpectedToken == '}') {
	          return {
	            vModel: vModel,
	            lps: j, // 返回主循环位置
	            ins: false // 不插入该符号后面的单词
	          };
	        } else if (j < symbolCount - 1 && symbols[j + 1] == '.') {

	          // 当 [] 或 () 之后还有 . 的情况
	          vModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] });

	          complexVariableBeginToken = false;
	          complexVariableExpectedToken = false;
	          complexVariableTokenRepeatTimes = 0;

	          continue;
	        }

	        vModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] });

	        return {
	          vModel: vModel,
	          lps: j, // 返回主循环位置
	          ins: true // 插入该符号后面的单词
	        };
	      } else {
	        /* 减少起始符号出现次数 */
	        complexVariableTokenRepeatTimes--;
	        vModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] + words[j] });
	      }
	    } else if (complexVariableBeginToken && symbols[j] == '\n') {
	      /* 所有表达式里的换行符应该被无视 */
	      vModel.sublayer.push({ type: TYPE_SYNTAX, val: words[j] });
	    } else {
	      if (!complexVariableBeginToken) {
	        return {
	          vModel: vModel,
	          lps: j - 1 // 返回主循环位置
	        };
	      } else {
	        vModel.sublayer.push({ type: TYPE_SYNTAX, val: symbols[j] + words[j] });
	      }
	    }
	  }

	  if (!complexVariableBeginToken) {
	    return {
	      vModel: vModel,
	      lps: j // 返回主循环位置
	    };
	  } else {
	    throwError('变量 ' + vModel.sublayer[0].val + ' 没有结束', vModel.begin);
	  }
	}

	/* 获得错误行的封装 */
	function throwError(text, begin) {
	  _error2.default.syntax(text, _error2.default.getLine(symbols, words, begin));
	  throw ': The program is stopped due to syntax error';
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _config = __webpack_require__(2);

	exports.default = {
	  syntax: syntax,
	  getLine: getLine
	};


	function syntax(notice, line) {
	  console.warn('[Line ' + line + '][Syntax Error] ' + notice);
	}

	function getLine(symbols, words, pos) {
	  var lineNumber; // 最终行数

	  var symbolString = symbols.slice(0, pos).join(''); // 截取整个模板字符串从开头到所在字符位置
	  var lines = symbolString.split('\n');
	  lineNumber = lines.length;

	  if (lines[0].trim() == '' && lines.length !== 1) lineNumber--;

	  if (_config.configs.exactErrorLine && window.$) {
	    $.ajax({ url: window.location.href, async: false, success: function success(html) {
	        var fullString = '';
	        for (var i = 0; i < symbols.length; i++) {
	          fullString += symbols[i] + words[i];
	        }

	        html = html.replace(/[^\S\n]/g, '');
	        fullString = fullString.replace(/[^\S\n]/g, '');

	        var before = html.substr(0, html.indexOf(fullString));
	        lineNumber += before.split('\n').length;
	      } });

	    return lineNumber + ' (In Html File)';
	  }

	  return lineNumber;
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _config = __webpack_require__(2);

	var _error = __webpack_require__(4);

	var _error2 = _interopRequireDefault(_error);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = compile;

	/* 正则表达式预编译 */

	var regEscapeQuote = /\'/g,
	    // 单引号
	regEscapeSlash = /\\/g,
	    // 斜线
	regNotW = /[^\w]/,
	    // 特殊符号
	reg0to9 = /[0-9]/,
	    // 0 - 9
	regReplaceString = /'(.*)'/g,
	    // 替换字符串为空
	regReplaceBracket = /\((.*)\)/g,
	    // 替换括号内内容为空
	regForeachExp = /\s+in\s+/g,
	    // foreach 表达式
	regSetExp1 = /(.*)[\w\s\]]=[^=]*[\w\s\[\{](.*)/,
	    // set 表达式 1
	regSetExp2 = /(.*)[\w\s\]]=$/; // set 表达式 2

	var TYPE_HTML = 1,
	    // HTML 类型
	TYPE_SYNTAX = 2,
	    // 语法类型
	TYPE_DIRECTIVE = 3,
	    // 指令类型
	TYPE_VARIABLE = 4,
	    // 变量类型
	TYPE_VARIABLE_QR = 5,
	    // 变量类型
	TYPE_STRING = 6,
	    // 字符串类型
	TYPE_STRING_CONTENT = 7; // 字符串内容类型

	/* 指令处理器对应表*/
	var processorHandlers = {
	  if: ifProcessor,
	  end: endProcessor,
	  else: elseProcessor,
	  elseif: elseifProcessor,
	  foreach: foreachProcessor,
	  break: breakProcessor,
	  set: setProcessor
	};

	var searchedVariables = [],
	    // 搜索到的变量名称
	procedureControlStack = []; // 流程控制指令栈

	// 用于报错及语法检查
	var symbols, words;

	/* 编译入口 */
	function compile(set) {
	  // 从 parse 得到的数据赋值
	  var parseStack = set.parseStack;
	  symbols = set.symbols;
	  words = set.words;

	  // Js Header
	  var jsCode = 'if(!Array.prototype.size){Array.prototype.size=function(){return this.length;};}var $data=arguments[0],$out=\'\';';

	  // 编译主要代码部分
	  var inner = recurseMake(parseStack, 0);

	  // 处理 if foreach 和 end 不配对的情况
	  if (procedureControlStack.length > 0) {
	    _error2.default.syntax('有 if 或 foreach 但缺少配对 end', 'EOF');
	    throw ': The program is stopped due to syntax error';
	  }

	  // 预编译变量
	  for (var i = 0; i < searchedVariables.length; i++) {
	    jsCode += 'var ' + searchedVariables[i] + '=$data.' + searchedVariables[i] + '||undefined;';
	  }

	  jsCode += inner;
	  jsCode += 'return $out;';

	  return jsCode;
	}

	/* 递归编译解析栈 (根据模型来生成) */
	function recurseMake(parseStack, layer) {
	  var jsCode = '';
	  var mergedHtml = '';

	  var segment; // 变量声明

	  for (var i = 0; i < parseStack.length; i++) {
	    if (parseStack[i].val && parseStack[i].val == '') continue;

	    if (parseStack[i].type == TYPE_HTML) {
	      mergedHtml += parseStack[i].val;

	      /* 预合并html部分提高性能 */
	      if (i == parseStack.length - 1 || i < parseStack.length - 1 && parseStack[i + 1].type != TYPE_HTML) {
	        var escaped = escapeSQ(mergedHtml);
	        if (escaped == '') continue;
	        jsCode += '$out+=\'' + escaped + '\';';
	        mergedHtml = '';
	      }
	    } else if (parseStack[i].type == TYPE_VARIABLE || parseStack[i].type == TYPE_VARIABLE_QR) {
	      // 只有当变量在第一层的时候才是输出
	      if (layer == 0) {
	        jsCode += '$out+=';
	      }

	      // 是不是安静引用
	      var isQr = parseStack[i].type == TYPE_VARIABLE_QR ? true : false;

	      // 递归生成的片段
	      segment = recurseMake(parseStack[i].sublayer, layer + 1);

	      // 一些变量特例，比如 $ 后紧跟数字或者单纯的 $
	      if (segment == '' || reg0to9.test(segment[0])) {

	        if (isQr) {
	          jsCode += '\'$!' + segment + '\'';
	        } else {
	          jsCode += '\'$' + segment + '\'';
	        }

	        if (layer == 0) jsCode += ';';
	        continue;
	      }

	      // 将搜索到的变量压入数组
	      var name = segment.split(regNotW)[0];
	      if (searchedVariables.indexOf(name) == -1) {
	        searchedVariables.push(name);
	      }

	      // 根据情况处理
	      if (isQr) {
	        // 使用 try catch 实现 Quiet Reference
	        jsCode += '(function(){try{return((' + segment + '||' + segment + '==0)?' + segment + ':\'\')}catch(e){return \'\';}})()';
	      } else if (_config.configs.undefinedOutput && (i == 0 || parseStack[i - 1].type == TYPE_HTML)) {
	        // 如果开启了 "变量不存在则原样输出" 这个选项，并且该变量在HTML内，则对其进行处理

	        // 此处思路为使用 try catch 来进行变量是否存在的判断，然后返回对应值或 $ + 原字符
	        var undefinedOutput = '$' + escapeSQ(segment);
	        jsCode += '(function(){try{return((' + segment + '||' + segment + '==0)?' + segment + ':\'' + undefinedOutput + '\')}catch(e){return \'' + undefinedOutput + '\';}})()';
	      } else {
	        jsCode += segment;
	      }

	      // 只有当变量在第一层的时候才是输出
	      if (layer == 0) {
	        jsCode += ';';
	      }
	    } else if (parseStack[i].type == TYPE_DIRECTIVE) {
	      // 调用指令处理器处理
	      segment = processorHandlers[parseStack[i].val](parseStack[i].sublayer ? recurseMake(parseStack[i].sublayer) : null);

	      // 语法检查报错处理
	      if (segment.error) {
	        _error2.default.syntax(segment.error, _error2.default.getLine(symbols, words, parseStack[i].begin));
	        throw ': The program is stopped due to syntax error';
	      }

	      jsCode += segment;
	    } else if (parseStack[i].type == TYPE_SYNTAX) {
	      jsCode += parseStack[i].val;
	    } else if (parseStack[i].type == TYPE_STRING_CONTENT) {
	      /* 对于字符串部分多做判断主要是为了更好的执行性能做优化 */

	      // 如果字符串是第一个，则加入起始标识 '
	      if (i == 0) {
	        jsCode += '\'';
	      }

	      // 如果字符串不在整个模型的第一个且上一个不是字符串，要在前面加上 +'
	      if (i > 0 && parseStack[i - 1].type != TYPE_STRING_CONTENT) {
	        jsCode += '+\'';
	      }

	      jsCode += parseStack[i].val; // 插入值

	      // 如果字符串不是最后一个且下一个元素不是字符串，则加入 + (可推测下一个是方法或变量)
	      if (i < parseStack.length - 1 && parseStack[i + 1].type !== TYPE_STRING_CONTENT) {
	        jsCode += '\'+';
	      }

	      // 如果字符串是最后一个，则加入结束标识 '
	      if (i == parseStack.length - 1) {
	        jsCode += '\'';
	      }
	    } else if (parseStack[i].type == TYPE_STRING) {
	      jsCode += recurseMake(parseStack[i].sublayer, layer + 1);
	    }

	    /* else if (parseStack[i].type == 'code') {
	      jsCode += parseStack[i].val;
	    }*/
	  }

	  return jsCode;
	}

	/* 转义字符串内的引号和slash */

	function escapeSQ(str) {
	  return str.replace(regEscapeSlash, '\\\\').replace(regEscapeQuote, '\\\'');
	}

	/* 各指令处理器 */

	function ifProcessor(expression) {
	  // 检查语法
	  var check = expression.replace(regReplaceString, '');
	  if (check.match(regSetExp1)) {
	    return {
	      error: '不应在 if 表达式里进行赋值操作'
	    };
	  }

	  // 流程控制指令压栈
	  procedureControlStack.push('if');

	  return 'if(' + expression + '){';
	}

	function elseifProcessor(expression) {
	  // 检查流程
	  if (procedureControlStack.slice(-1) != 'if') {
	    return {
	      error: '有 elseif 但没有 if'
	    };
	  }

	  // 检查语法
	  var check = expression.replace(regReplaceString, '');
	  if (check.match(regSetExp1)) {
	    return {
	      error: '不应在 elseif 表达式里进行赋值操作'
	    };
	  }

	  return '}else if(' + expression + '){';
	}

	function elseProcessor() {
	  // 检查流程
	  if (procedureControlStack.slice(-1) != 'if') {
	    return {
	      error: '有 else 但没有 if'
	    };
	  }

	  return '}else{';
	}

	function endProcessor() {
	  // 如果出现 end 但是栈已经是空的了
	  if (procedureControlStack.length == 0) {
	    return {
	      error: '存在 end 但缺少配对 if 或 foreach'
	    };
	  }

	  // 弹栈获得上个指令
	  var last = procedureControlStack.pop();

	  // 根据不同指令选择结束方式
	  if (last == 'if') {
	    return '}';
	  } else if (last == 'foreach') {
	    return '}})();';
	  }
	}

	function setProcessor(expression) {
	  // 检查语法
	  var check = expression.replace(regReplaceString, '').replace(regReplaceBracket, '');
	  if (!check.match(regSetExp1) && !check.match(regSetExp2)) {
	    return {
	      error: 'set 表达式语法不正确'
	    };
	  }

	  return expression + ';';
	}

	function breakProcessor() {
	  return 'break;';
	}

	function foreachProcessor(expression) {
	  // 流程控制指令压栈
	  procedureControlStack.push('foreach');

	  var expr = expression.split(regForeachExp); // 通过正则匹配出两个变量

	  // 语法不正确的情况
	  if (!expr || expr.length !== 2) {
	    return {
	      error: 'foreach 存在未识别的 token'
	    };
	  }

	  var arr = expr[1],
	      key = expr[0];

	  // 此处添加了函数块变量域支持
	  return '(function(){' + ('var foreach={},' + key + ';') + ('for(var $index=0,$length=' + arr + '.length;$index<$length;$index++){') + 'foreach.count=$index+1;' + 'foreach.index=$index;' + 'foreach.hasNext=($index<$length-1?true:false);' + (key + '=' + arr + '[$index];');
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  getRam: getRamCache,
	  setRam: setRamCache,
	  getSession: getSessionCache,
	  setSession: setSessionCache,
	  getKey: getKey
	};


	var ramCache = {};

	function getRamCache(key) {
	  return ramCache[key] ? ramCache[key] : null;
	}

	function setRamCache(key, fn) {
	  ramCache[key] = fn;
	}

	function getSessionCache(key) {
	  return sessionStorage ? sessionStorage.getItem(key) : null;
	}

	function setSessionCache(key, js) {
	  if (sessionStorage) {
	    sessionStorage.setItem(key, js);
	  }
	}

	function getKey(input) {
	  var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
	  var hash = 5381;
	  var i = input.length - 1;

	  for (; i > -1; i--) {
	    hash += (hash << 5) + input.charCodeAt(i);
	  }var value = hash & 0x7FFFFFFF;

	  var retValue = '';

	  do {
	    retValue += I64BIT_TABLE[value & 0x3F];
	  } while (value >>= 6);

	  return retValue;
	}

/***/ }
/******/ ]);