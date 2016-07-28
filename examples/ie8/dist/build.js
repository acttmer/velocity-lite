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
/******/ 	__webpack_require__.p = "";

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

	var parseFn = __webpack_require__(2),
	  compileFn = __webpack_require__(4);

	function Velocity(tpl) {
	  this.tpl = tpl;
	}

	module.exports = Velocity;

	Velocity.prototype = {
	  constructor: Velocity,
	  render: render,
	  compileCache: compileCache,
	  getKey: getKey
	};

	function render(data) {
	  if (!data) { return ''; }

	  return compileCache(this.tpl)(data);
	}

	function compileCache(tpl) {
	  compileCache.cache = compileCache.cache || {};
	  var key = getKey(tpl);
	  var result = compileCache.cache[key];
	  if (!result) {
	    result = compileCache.cache[key] = compile(parse(tpl));
	  }
	  return result;
	}

	function getKey(tpl) {
	  return tpl.replace(/\s*/mg, '').substring(0, 16);
	}

	function compile(content) {
	  return new Function('with(arguments[0]){' + content + '}');
	}

	function parse(tpl) {
	  return parseFn(tpl, compileFn);
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);

	module.exports = function(tpl, compileFn) {
	  tpl = run(step1, step2, step3, step4, step5, step6)(tpl);
	  var parseResult = reg(tpl, compileFn.keys.join('|'))(compileFn);
	  parseResult = 'var __=[];' + parseResult + ' return __.join(\'\');';
	  return parseResult;
	};

	function reg(tpl, token) {
	  var reg = new RegExp('(.*?)(?=#['+token+'])#(' + token + ')(?:\\(([^<#]*)\\))?([^#]*)', 'g');

	  return function(fn) {
	    var parseResult = '';
	    tpl.replace(reg, function() {
	      parseResult += fn(Array.prototype.slice.call(arguments));
	    });
	    if (!parseResult && tpl) {
	      parseResult += fn(tpl);
	    }
	    return parseResult;
	  };
	}

	function run(steps) {
	  steps = utils.isArray(steps) ? steps : Array.prototype.slice.call(arguments);
	  return function runStep(tpl) {
	    var step = steps.shift();

	    if (step) {
	      tpl = step(tpl);
	      return runStep(tpl);
	    } else {
	      return tpl;
	    }
	  };
	}

	// 去掉前边的 空格[[空格
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

	// 去掉回车, 换行符，去掉(前的空格
	function step4(tpl) {
	  return tpl.replace(/(\r|\n|\r\n|\s+(?=\())/g, '');
	}

	// 去掉 < 两边的空格
	function step5(tpl) {
	  return tpl.replace(/\s*<\s*/g, '<');
	}

	//替换 </s 或者<1 为 &1
	function step6(tpl) {
	  return tpl.replace(/<([^!\/a-zA-Z])/g, '&lt$1');
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
	  guid: guid,
	  isArray: isArray,
	  isFunction: isFunction
	};

	function guid() {
	  guid.number = guid.number >= 0 ? (guid.number + 1) : 0;
	  return guid.number;
	}

	function isArray(obj) {
	  return Object.prototype.toString.call(obj) === '[object Array]';
	}

	function isFunction(obj){
	  return Object.prototype.toString.call(obj) === '[object Function]';
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3),
	  log = __webpack_require__(5);

	var compile = expControl([foreachExp, setExp, ifExp, elseExp, elseifExp, breakExp, endExp]);

	compile.parseExp = parseExp;

	module.exports = compile;

	function expControl(opts) {
	  expControl.cache = expControl.cache || {};
	  compile.keys = compile.keys || [];
	  var key;
	  opts.forEach(function(fn) {
	    key = fn.name.replace(/Exp/, '');
	    expControl.cache[key] = fn;
	    compile.keys.push(key);
	  });


	  function compile(result) {
	    if (!utils.isArray(result)) {
	      return '__.push(' + parseExp(result) + ');';
	    } else if (result.length !== 7) {
	      return;
	    }
	    var key = result[2],
	      express = result[3],
	      body_front = result[1],
	      body_end = result[4];
	    var _ = '';
	    if (body_front) {
	      _ += '__.push(' + parseExp(body_front) + ');';
	    }
	    var fn = expControl.cache[key];
	    if (!utils.isFunction(fn)) {
	      return;
	    }
	    _ += fn.call(null, express);
	    if (body_end) {
	      _ += '__.push(' + parseExp(body_end) + ');';
	    }
	    return _;
	  }
	  return compile;
	}

	function foreachExp(exp) {
	  var expr = exp.replace(/\$/g, '').split(/\s+in\s+/);
	  var id = utils.guid();
	  if (!expr || expr.length !== 2) {
	    log.error('语法解析错误,' + exp + '');
	  }
	  return 'for(var _v' + id + ' in ' + expr[1] + '){var ' + expr[0] + '=' + expr[1] + '[_v' + id + '];';
	}

	function setExp(exp) {
	  if (exp.indexOf('.') > 0) {
	    return exp.replace(/\$/g, '') + ';';
	  }
	  return 'var ' + exp.replace(/\$/g, '') + ';';
	}

	function ifExp(exp) {
	  return 'if(' + parseExp(exp) + '){';
	}

	function elseExp() {
	  return '}else{';
	}

	function elseifExp(exp) {
	  return '}else if(' + exp.replace(/\$/g, '') + '){';
	}

	function breakExp() {
	  return 'break;';
	}

	function endExp() {
	  return '}';
	}

	function validate(chStack, chValidates) {
	  var obj = {};
	  chValidates.forEach(function(chValidate) {
	    obj[chValidate[0]] = 1;
	    obj[chValidate[1]] = 1;
	  });
	  chStack.forEach(function(ch) {
	    if (obj[ch]) {
	      obj[ch] = obj[ch] + 1;
	    }
	  });

	  chValidates.forEach(function(chValidate) {
	    var begin = obj[chValidate[0]];
	    var end = obj[chValidate[1]];
	    if (begin > end) {
	      log.error(' 语法解析错误,'+ chStack.join('') + '  缺少 ' + chValidate[1] + '符号');
	    } else if(begin < end) {
	      log.error(' 语法解析错误,'+ chStack.join('') + '  缺少 ' + chValidate[0] + '符号');
	    }

	  });
	}
	/** 弹栈解析 */
	function pop(chStack, end) {
	  var popCh, str = ')';

	  do {
	    popCh = chStack.pop();
	    if (popCh === '}' && end > 0) {
	      end--;
	      str = pop(chStack, end) + str;
	    } else if (popCh === '{') {
	      popCh = chStack.pop();
	      str = '(' + str;
	      if (popCh === '!') {
	        str = '(function() {try {return(' + str + '?' + str + ':\'\')' + '} catch(e) {return \'\';}})()';
	        popCh = chStack.pop();
	      }
	      return str;
	    } else {
	      str = popCh + str;
	    }
	  } while (popCh);
	}

	/** 压栈解析 */
	function parseExp(content) {
	  var result = [], chStack = [], begin = 0, end = 0;
	  var chs = content.split('');

	  chs.forEach(function(ch, index, chs) {
	    if (ch === '$' && (chs[index + 1] === '!' || content[index + 1] === '{')) {
	      if (begin === 0) {
	        result.push('\'' + chStack.join('') + '\'');
	        chStack = [];
	      }
	      chStack.push('$');
	      begin++;
	    } else if (ch === '}' && (begin - end === 1)) {
	      chStack.push('}');
	      validate(chStack, ['{}', '[]', '()']);
	      chStack.pop();
	      result.push(pop(chStack, end));
	      chStack = [], begin = 0, end = 0;
	    } else if (ch === '}') {
	      chStack.push('}');
	      end++;
	    } else {
	      chStack.push(ch);
	    }
	  });
	  if (chStack.length > 0) {
	    validate(chStack, ['{}', '[]', '()']);
	    result.push('\'' + chStack.join('') + '\'');
	  }
	  if (begin !== 0 || end !== 0) {
	    log.error('表达式未完结, 缺少{字符');
	  }
	  return result.join('+');
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	
	module.exports = {
	  info: function(msg) {
	    console.log(msg);
	  },
	  error: function(msg) {
	    throw new Error('velocity error :' + msg);
	  }
	};


/***/ }
/******/ ]);