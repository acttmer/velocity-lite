// Still working on this conversion

// This script is used to create es3 support, and fix 'Object.defineProperty' in babel for es3 browsers
// Should be only used for this project ^=^

var config = require('./package.json');
var targetFile = './lib/velocity-lite.' + config.version + '.es3.js';

var fs = require('fs');
var content = fs.readFileSync(targetFile, 'utf-8');

var output = '/* ES3 Final Support */\n\n';

output += __es3_patch_indexOf;
output += __es3_patch_split;
output += __es3_patch_objectNames;

output += '__es3_patch_objectNames();';
output += '__es3_patch_indexOf();';
output += '__es3_patch_split();';

output += '\n\n/* Main Code */\n\n';

output += content.replace(/Object\.defineProperty\(r,"__esModule",\{value:\!0\}\)/g, 'r["__esModule"]=true')
                 .replace(/Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value: true\s*\}\s*\);/g, 'exports["__esModule"] = true;')
                 
                 // Fix for inner code (While avoiding the increase of the size of the final js file)
                 .replace(/\"\\n\"==d\[(.+?)\]/g, '("\\n"==d[$1]||"\\r"==d[$1])')
                 .replace(/symbols\[(.+?)\]\s*==\s*\'\\n\'/g, '(symbols[$1] == \'\\n\' || symbols[$1] == \'\\r\')');

fs.writeFileSync(targetFile, output);

console.log('The fix for ECMAScript 3 has been applied to the js file');


function __es3_patch_objectNames() {
Object.getOwnPropertyNames=function getOwnPropertyNames(b){var a=[];var d;var f=["length","name","arguments","caller","prototype","observe","unobserve"];if(typeof b==="undefined"||b===null){throw new TypeError("Cannot convert undefined or null to object")}b=Object(b);for(d in b){if(Object.prototype.hasOwnProperty.call(b,d)){a.push(d)}}for(var c=0,e=f.length;c<e;c++){if(f[c] in b){a.push(f[c])}}return a};
}

function __es3_patch_indexOf() {
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(b){var a=this.length>>>0;var c=Number(arguments[1])||0;c=(c<0)?Math.ceil(c):Math.floor(c);if(c<0){c+=a}for(;c<a;c++){if(c in this&&this[c]===b){return c}}return -1}};
}

function __es3_patch_split() {
var split;split=split||function(b){var d=String.prototype.split,c=/()??/.exec("")[1]===b,a;a=function(m,j,i){if(Object.prototype.toString.call(j)!=="[object RegExp]"){return d.call(m,j,i)}var g=[],h=(j.ignoreCase?"i":"")+(j.multiline?"m":"")+(j.extended?"x":"")+(j.sticky?"y":""),e=0,j=new RegExp(j.source,h+"g"),f,k,l,n;m+="";if(!c){f=new RegExp("^"+j.source+"$(?!\\s)",h)}i=i===b?-1>>>0:i>>>0;while(k=j.exec(m)){l=k.index+k[0].length;if(l>e){g.push(m.slice(e,k.index));if(!c&&k.length>1){k[0].replace(f,function(){for(var o=1;o<arguments.length-2;o++){if(arguments[o]===b){k[o]=b}}})}if(k.length>1&&k.index<m.length){Array.prototype.push.apply(g,k.slice(1))}n=k[0].length;e=l;if(g.length>=i){break}}if(j.lastIndex===k.index){j.lastIndex++}}if(e===m.length){if(n||!j.test("")){g.push("")}}else{g.push(m.slice(e))}return g.length>i?g.slice(0,i):g};String.prototype.split=function(f,e){return a(this,f,e)};return a}();
}