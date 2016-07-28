import {configs} from './config';
import error from './error';

export default compile;

/* 正则表达式预编译 */
const regEscapeQuote = /\'/g, // 单引号
  regEscapeSlash = /\\/g, // 斜线
  regNotW = /[^\w]/, // 特殊符号
  reg0to9 = /[0-9]/, // 0 - 9
  regReplaceString = /'(.*)'/g, // 替换字符串为空
  regReplaceBracket = /\((.*)\)/g, // 替换括号内内容为空
  regForeachExp = /\s+in\s+/g, // foreach 表达式
  regSetExp1 = /(.*)[\w\s\]]=[^=]*[\w\s\[\{](.*)/, // set 表达式 1
  regSetExp2 = /(.*)[\w\s\]]=$/; // set 表达式 2


const TYPE_HTML = 1, // HTML 类型
  TYPE_SYNTAX = 2, // 语法类型
  TYPE_DIRECTIVE = 3, // 指令类型
  TYPE_VARIABLE = 4, // 变量类型
  TYPE_VARIABLE_QR = 5, // 变量类型
  TYPE_STRING = 6, // 字符串类型
  TYPE_STRING_CONTENT = 7; // 字符串内容类型


/* 指令处理器对应表*/
const processorHandlers = {
  if: ifProcessor,
  end: endProcessor,
  else: elseProcessor,
  elseif: elseifProcessor,
  foreach: foreachProcessor,
  break: breakProcessor,
  set: setProcessor
};

var searchedVariables = [], // 搜索到的变量名称
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
    error.syntax('有 if 或 foreach 但缺少配对 end', 'EOF');
    throw ': The program is stopped due to syntax error';
  }

  // 预编译变量
  for (var i = 0; i < searchedVariables.length; i++){
    jsCode += `var ${searchedVariables[i]}=$data.${searchedVariables[i]}||undefined;`;
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
      if (i == parseStack.length - 1 || (i < parseStack.length - 1 && parseStack[i+1].type != TYPE_HTML)) {
        var escaped = escapeSQ(mergedHtml);
        if (escaped == '') continue;
        jsCode += `$out+='${escaped}';`;
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
      if (segment == '' || reg0to9.test(segment[0])){

        if (isQr) {
          jsCode += `'$!${segment}'`;
        } else {
          jsCode += `'$${segment}'`;
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
        jsCode += `(function(){try{return((${segment}||${segment}==0)?${segment}:'')}catch(e){return '';}})()`;

      } else if (configs.undefinedOutput && (i == 0 || parseStack[i - 1].type == TYPE_HTML)) {
        // 如果开启了 "变量不存在则原样输出" 这个选项，并且该变量在HTML内，则对其进行处理

        // 此处思路为使用 try catch 来进行变量是否存在的判断，然后返回对应值或 $ + 原字符
        var undefinedOutput = '$' + escapeSQ(segment);
        jsCode += `(function(){try{return((${segment}||${segment}==0)?${segment}:'${undefinedOutput}')}catch(e){return '${undefinedOutput}';}})()`;

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
        error.syntax(segment.error, error.getLine(symbols, words, parseStack[i].begin));
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

function escapeSQ(str){
  return str.replace(regEscapeSlash, '\\\\').replace(regEscapeQuote, '\\\'');
}


/* 各指令处理器 */

function ifProcessor(expression){
  // 检查语法
  var check = expression.replace(regReplaceString, '');
  if (check.match(regSetExp1)) {
    return {
      error: '不应在 if 表达式里进行赋值操作'
    };
  }

  // 流程控制指令压栈
  procedureControlStack.push('if');

  return `if(${expression}){`;
}

function elseifProcessor(expression){
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

  return `}else if(${expression}){`;
}

function elseProcessor(){
  // 检查流程
  if (procedureControlStack.slice(-1) != 'if') {
    return {
      error: '有 else 但没有 if'
    };
  }

  return '}else{';
}

function endProcessor(){
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

function setProcessor(expression){
  // 检查语法
  var check = expression.replace(regReplaceString, '').replace(regReplaceBracket, '');
  if (!check.match(regSetExp1) && !check.match(regSetExp2)) {
    return {
      error: 'set 表达式语法不正确'
    };
  }

  return `${expression};`;
}

function breakProcessor(){
  return 'break;';
}

function foreachProcessor(expression){
  // 流程控制指令压栈
  procedureControlStack.push('foreach');

  var expr = expression.split(regForeachExp); // 通过正则匹配出两个变量

  // 语法不正确的情况
  if (!expr || expr.length !== 2){
    return {
      error: 'foreach 存在未识别的 token'
    };
  }

  var arr = expr[1], key = expr[0];

  // 此处添加了函数块变量域支持
  return '(function(){'
     + `var foreach={},${key};`
     + `for(var $index=0,$length=${arr}.length;$index<$length;$index++){`
      + 'foreach.count=$index+1;'
      + 'foreach.index=$index;'
      + 'foreach.hasNext=($index<$length-1?true:false);'
      + `${key}=${arr}[$index];`;
}
