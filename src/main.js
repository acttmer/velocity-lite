import {setConfig, configs} from './config';
import parse from './parse';
import compile from './compile';
import cache from './cache';

function Velocity(template){
  this.template = template;
}

module.exports = Velocity;

Velocity.prototype = {
  render: render,
  parse: getParse,
  getVM: getVM
}

/* 默认插件 */
Velocity.plugins = {};

/* 注册插件静态方法 */
Velocity.register = function(keys, methods) {
  if (keys.constructor == String) {
    var key = keys;
    Velocity.plugins[key] = methods;
  } else {
    for (var key in keys) {
      Velocity.plugins[key] = keys[key];
    }
  }
}

/* 注册配置静态方法 */
Velocity.config = setConfig;

/* 主渲染函数 */
function render(data){
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

/* 生成预编译代码 */
function getParse(template) {
  return compile(parse(template), template);
}

/* 生成虚拟机 */
function getVM(template){
  var key = cache.getKey(template);
  var ramCache = cache.getRam(key);
  var fn;

  if (ramCache === null) {
    var sessionCache = cache.getSession(key);
    if (configs.sessionCache && sessionCache !== null) {
      fn = new Function(sessionCache);

    } else {
      var jsCode = getParse(template);

      fn = new Function(jsCode);

      if (configs.sessionCache) {
        cache.setSession(key, jsCode);
      }
    }

    cache.setRam(key, fn);

  } else {
    fn = ramCache;
  }

  return fn;
}
