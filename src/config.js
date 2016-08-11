/* 导出变量 */
export var configs = {
  undefinedOutput: false, // 是否启用未定义原样输出
  sessionCache: false, // 是否启用 sessionStorage 作为缓存实现
  exactErrorLine: false, // 获取准确的错误行数 (指在HTML文件里的行数, 需 Jquery 或 Zepto 支持)
  arraySize: true // 是否内部支持数组 .size() 方法
};

export function setConfig(params){
  for (var key in params) {
    configs[key] = params[key];
  }
}
