(()=>{var e={153:(e,r,t)=>{e.exports=()=>'<div class="component">\n  <h1>Common JS</h1>\n  \x3c!-- variable passed via loader `data` option --\x3e\n  <h2>My component</h2>\n  \x3c!-- variable passed via template query parameter in JS --\x3e\n  <div>Hello CommonJS!</div>\n  <img src="'+t(598)+'">\n</div>'},290:(e,r,t)=>{e.exports=()=>'<div class="component">\n  <h1>ES Module</h1>\n  \x3c!-- variable passed via loader `data` option --\x3e\n  <h2>My component</h2>\n  \x3c!-- variable passed via template query parameter in JS --\x3e\n  <div>Hello ES Module!</div>\n  <img src="'+t(598)+'">\n</div>'},676:(e,r,t)=>{const n=t(153);document.getElementById("app-cjs").innerHTML=n()},598:(e,r,t)=>{"use strict";e.exports=t.p+"img/stern.6adb226f.svg"}},r={};function t(n){var o=r[n];if(void 0!==o)return o.exports;var a=r[n]={exports:{}};return e[n](a,a.exports,t),a.exports}t.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return t.d(r,{a:r}),r},t.d=(e,r)=>{for(var n in r)t.o(r,n)&&!t.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:r[n]})},t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),t.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),(()=>{var e;t.g.importScripts&&(e=t.g.location+"");var r=t.g.document;if(!e&&r&&(r.currentScript&&(e=r.currentScript.src),!e)){var n=r.getElementsByTagName("script");if(n.length)for(var o=n.length-1;o>-1&&!e;)e=n[o--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),t.p=e})(),(()=>{"use strict";t(676);var e=t(290),r=t.n(e);document.getElementById("app-esm").innerHTML=r()(),console.log(">> app")})()})();