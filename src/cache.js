export default {
  getRam: getRamCache,
  setRam: setRamCache,
  getSession: getSessionCache,
  setSession: setSessionCache,
  getKey: getKey
}

var ramCache = {};

function getRamCache(key) {
  return ramCache[key] ? ramCache[key] : null;
}

function setRamCache(key, fn) {
  ramCache[key] = fn;
}

function getSessionCache(key) {
  return window.sessionStorage ? sessionStorage.getItem(key) : null;
}

function setSessionCache(key, js) {
  if (window.sessionStorage) {
    sessionStorage.setItem(key, js);
  }
}

function getKey(input){
  var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
  var hash = 5381;
  var i = input.length - 1;

  for (; i > -1; i--)
    hash += (hash << 5) + input.charCodeAt(i);

  var value = hash & 0x7FFFFFFF;

  var retValue = '';

  do {
    retValue += I64BIT_TABLE[value & 0x3F];
  }
  while((value >>= 6));

  return retValue;
}
