import error from './error';

export default parse;

/* 关键字列表 */
const keywords = ['if', 'else', 'elseif', 'end', 'set', 'foreach', 'break'];
const keywordsNeedSublayer = ['if', 'elseif', 'set', 'foreach'];

const TYPE_HTML = 1, // HTML 类型
  TYPE_SYNTAX = 2, // 语法类型
  TYPE_DIRECTIVE = 3, // 指令类型
  TYPE_VARIABLE = 4, // 变量类型
  TYPE_VARIABLE_QR = 5, // 变量类型
  TYPE_STRING = 6, // 字符串类型
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
  parseStack.push({type: TYPE_HTML, val: words.shift()});

  for (var i = 0; i < symbolCount; i++) {
    var hasNext = i < symbolCount - 1 ? true : false; // 是否存在下一项

    if (symbols[i] == '$') {
      /* 如遇变量，调用递归变量解析器，根据返回结果进行操作 */
      res = variableHandler(i);

      parseStack.push(res.vModel);
      if (res.ins) parseStack.push({type: TYPE_HTML, val: words[res.lps]});
      i = res.lps;

    } else if (symbols[i] == '#'){
      if (hasNext && symbols[i+1] == '#' && words[i] == '') {
        /* 单行注释的情况 */
        i = commentHandler(i+1);

      } else if (hasNext && symbols[i+1] == '*' && words[i] == '') {
        /* 多行注释的情况 */
        i = multilineCommentHandler(i+1);

      } else if (symbols.slice(i, i+3).join('') == '#[[' && words.slice(i, i+2).join('') == ''){
        /* 不进行转义的情况 */
        res = pureHtmlHandler(i+2);

        parseStack.push(res.hModel);
        i = res.lps;

      } else {
        /* 指令处理的情况 */
        res = directiveHandler(i);

        parseStack.push(res.dModel);
        if (res.ins) parseStack.push({type: TYPE_HTML, val: words[res.lps]});
        i = res.lps;

      }

    } else if (symbols[i] == '\\' && hasNext && words[i] == '') {
      /* 遭遇转义字符的情况 */
      parseStack.push({type: TYPE_HTML, val: symbols[i+1] + words[i+1]});
      i++;

    } else if (symbols[i] == '\n') {
      /* 所有 HTML 内容里的 \n 应被无视 */
      parseStack.push({type: TYPE_HTML, val: words[i]});

    } else {
      /* 其他特殊符号的情况 */
      parseStack.push({type: TYPE_HTML, val: symbols[i] + words[i]});
    }
  }

  // 返回编译资源
  return { parseStack, symbols, words };
}


/* 纯html文本解析器 */
function pureHtmlHandler(pos){
  var hModel = {type: 'html', val: words[pos]};

  for (var j = pos + 1; j < symbolCount; j++) {
    if (symbols[j] == ']' && symbols.slice(j, j+3).join('') == ']]#' && words.slice(j, j+2).join('') == '') {
      hModel.val += words[j + 2];
      return {
        hModel,
        lps: j + 2
      };

    } else if (symbols[j] == '\n'){
      // 所有 HTML 内容里的 \n 应被无视
      hModel.val += words[j];

    } else {
      hModel.val += symbols[j] + words[j];
    }
  }

  throwError('防止转义没有结束标识', 'EOF');
}


/* 注释解析器 */
function commentHandler(pos){
  for (var j = pos + 1; j < symbolCount; j++) {
    if (symbols[j] == '\n') {
      return j; // 返回主循环位置
    }
  }
  return j;
}


/* 多行注释解析器 */
function multilineCommentHandler(pos){
  for (var j = pos + 1; j < symbolCount; j++) {
    if (symbols[j] == '*' && j < symbolCount - 1 && symbols[j+1] == '#'){
      return j + 1; // 返回主循环位置
    }
  }

  throwError('多行注释没有结束标识', 'EOF');
}


/* 用于指令解析的处理器 */
function directiveHandler(pos){
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
      dModel.sublayer.push({type: TYPE_SYNTAX, val: words[j]});
      sublayerBegin = true;

    } else if (sublayerBegin && symbols[j] == '(') {
      /* 遭遇表达式开始标识的情况 */
      dModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j] + words[j]});
      beginBracketRepeatTimes++;

    } else if (sublayerBegin && symbols[j] == ')'){
      /* 遭遇表达式结束标识的情况 */
      if (beginBracketRepeatTimes == 0){
        return {
          dModel,
          lps: j, // 返回主循环位置
          ins: true // 插入该符号后面的单词
        };

      } else {
        dModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j] + words[j]});
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
      dModel.sublayer.push({type: TYPE_SYNTAX, val: words[j]});

    } else {
      if (!sublayerBegin){
        /* 如果搜索没发现表达式，去查询一下是否需要 */
        if (keywordsNeedSublayer.indexOf(words[pos]) >= 0){
          if (symbols[j] == ' '){
            continue;
          } else {
            throwError(`指令 ${dModel.val} 缺少 (`, j);
          }
        }

        if (keywords.indexOf(dModel.val) == -1){
          throwError(`指令 ${dModel.val} 不存在`, j);
        }

        dModel.sublayer = false;
        return {
          dModel,
          lps: j - 1, // 返回主循环位置
          ins: false // 不插入该符号后面的单词
        };
      } else {
        if (symbols[j] == '#') {
          throwError(`指令 ${dModel.val} 未结束并遭遇另一个指令符号 #`, dModel.begin);
        }

        dModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j] + words[j]});
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
    throwError(`指令 ${dModel.val} 没有结束`, dModel.begin);
  }
}


/* 用于字符串解析的处理器 */
function stringHandler(pos) {
  /* 此处构建复杂模型用于支持字符串内变量解析 */
  var sModel = {type: TYPE_STRING, sublayer: [{type: TYPE_STRING_CONTENT, val: words[pos]}], begin: pos};
  var expect = symbols[pos]; // 记录下字符串起始符号 (双引号或单引号)

  for (var j = pos + 1; j < symbolCount; j++) {
    if (symbols[j] == '\\') {
      /* 遭遇字符转义的情况 */
      sModel.sublayer.push({type: TYPE_STRING_CONTENT, val: symbols[j+1] + words[j+1]});
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
      throwError(`字符串 '${sModel.sublayer[0].val}' 没有结束`, sModel.begin);

    } else {
      sModel.sublayer.push({type: TYPE_STRING_CONTENT, val: symbols[j] + words[j]});
    }
  }

  throwError(`字符串 '${sModel.sublayer[0].val}' 没有结束`, sModel.begin);
}


/* 用于变量解析的递归处理器 */
function variableHandler(pos) {

  var vModel = {
    type: TYPE_VARIABLE,
    sublayer: [
      {type: TYPE_SYNTAX, val: words[pos]}
    ],
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

    } else if (symbols[j] == '!'){
      /* Quiet Reference 的情况 */
      if (!complexVariableBeginToken){
        vModel.type = TYPE_VARIABLE_QR;
        vModel.sublayer.push({type: TYPE_SYNTAX, val: words[j]});
      } else {
        vModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j] + words[j]});
      }

    } else if (complexVariableBeginToken && (symbols[j] == '"' || symbols[j] == '\'')){
      /* 字符串的情况 */
      res = stringHandler(j);

      vModel.sublayer.push(res.sModel);
      j = res.lps;

    } else if (symbols[j] == '.') {
      /* 在变量中的遇到 . 按正常语法处理 */
      vModel.sublayer.push({type: TYPE_SYNTAX, val: '.' + words[j]});

    } else if (!complexVariableBeginToken && (symbols[j] == '(' || symbols[j] == '{' || symbols[j] == '[')) {
      /* 各种起始符号的对应结束符号 */
      complexVariableBeginToken = symbols[j];

      if (complexVariableBeginToken == '(') complexVariableExpectedToken = ')';
      else if (complexVariableBeginToken == '[') complexVariableExpectedToken = ']';
      else if (complexVariableBeginToken == '{') complexVariableExpectedToken = '}';

      /* 对 } 符号特殊化处理 */
      vModel.sublayer.push({type: TYPE_SYNTAX, val: (complexVariableBeginToken !== '{' ? complexVariableBeginToken : '') + words[j]});

    } else if (symbols[j] === complexVariableBeginToken){
      /* 变量中再次出现起始符号则增加次数统计 */
      complexVariableTokenRepeatTimes++;
      vModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j] + words[j]});

    } else if (symbols[j] === complexVariableExpectedToken){
      /* 判断是否变量已经结束 */
      if (complexVariableTokenRepeatTimes == 0) {
        if (complexVariableExpectedToken == '}') {
          return {
            vModel,
            lps: j, // 返回主循环位置
            ins: false // 不插入该符号后面的单词
          };

        } else if (j < symbolCount - 1 && symbols[j + 1] == '.') {

          // 当 [] 或 () 之后还有 . 的情况
          vModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j]});

          complexVariableBeginToken = false;
          complexVariableExpectedToken = false;
          complexVariableTokenRepeatTimes = 0;

          continue;
        }

        vModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j]});

        return {
          vModel,
          lps: j, // 返回主循环位置
          ins: true // 插入该符号后面的单词
        };

      } else {
        /* 减少起始符号出现次数 */
        complexVariableTokenRepeatTimes--;
        vModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j] + words[j]});
      }

    } else if (complexVariableBeginToken && symbols[j] == '\n') {
      /* 所有表达式里的换行符应该被无视 */
      vModel.sublayer.push({type: TYPE_SYNTAX, val: words[j]});

    } else {
      if (!complexVariableBeginToken) {
        return {
          vModel,
          lps: j - 1 // 返回主循环位置
        };
      } else {
        vModel.sublayer.push({type: TYPE_SYNTAX, val: symbols[j] + words[j]});
      }
    }
  }

  if (!complexVariableBeginToken) {
    return {
      vModel,
      lps: j // 返回主循环位置
    };
  } else {
    throwError(`变量 ${vModel.sublayer[0].val} 没有结束`, vModel.begin);
  }
}

/* 获得错误行的封装 */
function throwError(text, begin){
  error.syntax(text, error.getLine(symbols, words, begin));
  throw ': The program is stopped due to syntax error';
}
