import {configs} from './config';

export default {
  syntax: syntax,
  getLine: getLine
};

function syntax(notice, line){
  console.warn(`[Line ${line}][Syntax Error] ${notice}`);
}

function getLine(symbols, words, pos){
  var lineNumber; // 最终行数

  var symbolString = symbols.slice(0, pos).join(''); // 截取整个模板字符串从开头到所在字符位置
  var lines = symbolString.split('\n');
  lineNumber = lines.length;

  if (lines[0].trim() == '' && lines.length !== 1) lineNumber--;

  if (configs.exactErrorLine && window.$) {
    $.ajax({ url: window.location.href, async: false, success: function(html){
      var fullString = '';
      for (var i = 0; i < symbols.length; i++) {
        fullString += symbols[i] + words[i];
      }

      html = html.replace(/[^\S\n]/g, '');
      fullString = fullString.replace(/[^\S\n]/g, '');

      var before = html.substr(0, html.indexOf(fullString));
      lineNumber += before.split('\n').length;
    }});

    return lineNumber + ' (In Html File)';
  }

  return lineNumber;
}
