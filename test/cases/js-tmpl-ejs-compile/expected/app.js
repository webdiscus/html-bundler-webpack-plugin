(()=>{var __webpack_modules__={411:(module,__unused_webpack_exports,__webpack_require__)=>{function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return null==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){null!=e&&(__output+=e)}with(locals||{}){__append("<h1>Hello "),__append(escapeFn(name)),__append('!</h1>\n<div>Global data: title = "'),__append(escapeFn(title)),__append('"</div>\n<div>Query param: lang = "'),__append(escapeFn(lang)),__append('"</div>\n<p>People:</p>\n<ul class="people">\n    ');for(let i=0;i<people.length;i++)__append("\n    <li>"),__append(escapeFn(people[i])),__append("</li>\n    ");__append("\n</ul>\n\n"),__append("\n"),__append(__webpack_require__(983)({...locals})),__append("\n\n"),__append("\n"),__append(__webpack_require__(983)({...locals,nested:{name:"Armageddon"},title:"Included data",lang:"de"}))}return __output}var data={title:"My Title",lang:"en"},template=e=>anonymous(Object.assign(data,e));module.exports=template},983:(module,__unused_webpack_exports,__webpack_require__)=>{function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return null==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){null!=e&&(__output+=e)}with(locals||{})__append('<div class="star">++ Included partial ++</div>\n<div>passed variable: nested.name = "'),__append(escapeFn(nested.name)),__append('"</div>\n<div>passed global variable: title = "'),__append(escapeFn(title)),__append('"</div>\n<div>passed query variable: lang = "'),__append(escapeFn(lang)),__append('"</div>\n\n'),__append("\n"),__append(__webpack_require__(799)({...locals}));return __output}var data={title:"My Title"},template=e=>anonymous(Object.assign(data,e));module.exports=template},799:(module,__unused_webpack_exports,__webpack_require__)=>{function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return null==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){null!=e&&(__output+=e)}with(locals||{})__append('<div class="star">++ Included image ++</div>\n<img src="'+__webpack_require__(238)+'">');return __output}var data={title:"My Title"},template=e=>anonymous(Object.assign(data,e));module.exports=template},238:(e,_,a)=>{"use strict";e.exports=a.p+"img/stern.6adb226f.svg"}},__webpack_module_cache__={};function __webpack_require__(e){var _=__webpack_module_cache__[e];if(void 0!==_)return _.exports;var a=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](a,a.exports,__webpack_require__),a.exports}__webpack_require__.n=e=>{var _=e&&e.__esModule?()=>e.default:()=>e;return __webpack_require__.d(_,{a:_}),_},__webpack_require__.d=(e,_)=>{for(var a in _)__webpack_require__.o(_,a)&&!__webpack_require__.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:_[a]})},__webpack_require__.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),__webpack_require__.o=(e,_)=>Object.prototype.hasOwnProperty.call(e,_),(()=>{var e;__webpack_require__.g.importScripts&&(e=__webpack_require__.g.location+"");var _=__webpack_require__.g.document;if(!e&&_&&(_.currentScript&&"SCRIPT"===_.currentScript.tagName.toUpperCase()&&(e=_.currentScript.src),!e)){var a=_.getElementsByTagName("script");if(a.length)for(var n=a.length-1;n>-1&&(!e||!/^http(s?):/.test(e));)e=a[n--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),__webpack_require__.p=e})(),(()=>{"use strict";var e=__webpack_require__(411);const _=__webpack_require__.n(e)()({name:"World",people:["Alexa <Amazon>","Cortana <MS>","Siri <Apple>"],nested:{name:"EJS"}});document.getElementById("main").innerHTML=_,console.log(">> app")})()})();