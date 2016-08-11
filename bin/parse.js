var path = require('path');
var fs = require('fs');
var program = require('commander');
var pkg = require('../package.json');
require('../lib/velocity-lite.' + pkg.version + '.js');

program
  .version(pkg.version)
  .option('-P, --path <str>', 'parse file path')
  .option('-F, --fname <str>', 'function name')
  .parse(process.argv);

(function(){
  try {
    var velocity = new Velocity();
    var template = getTemplate();
    var result = velocity.parse(template.toString());
    var name = getFunctionName();
    result = 'function ' + name + '() {' + result + '}';
    out(result.replace(/\n|\r/g, ''));
  } catch(e) {
    console.log(e);
    program.help();
  }
})();

function getTemplate() {
  var templatePath = getPath();
  if (!fs.existsSync(templatePath)) throw new Error('不存在这个文件');
  return fs.readFileSync(templatePath);
}

function getPath() {
  var relativePath = program.path;
  if (!relativePath) throw new Error('请您输入文件路径');
  return path.join(process.cwd(), relativePath);
}

function getFunctionName() {
  var fname = program.fname;
  if (!fname) throw new Error('请您输入生成方法的名称');
  return fname;
}

function out(content) {
  var templatePath = getPath() + '.parse';
  fs.writeFileSync(templatePath, content);
}
