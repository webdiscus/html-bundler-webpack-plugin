(()=>{var e={456:e=>{var n=/["&<>]/;e.exports=function(e){var r,t="",a=e||{};return function(e){t=t+"<h2>Component: "+function(e){var r=""+e,t=n.exec(r);if(!t)return e;var a,o,u,i="";for(a=t.index,o=0;a<r.length;a++){switch(r.charCodeAt(a)){case 34:u="&quot;";break;case 38:u="&amp;";break;case 60:u="&lt;";break;case 62:u="&gt;";break;default:continue}o!==a&&(i+=r.substring(o,a)),o=a+1,i+=u}return o!==a?i+r.substring(o,a):i}(null==(r=e)?"":r)+"</h2><p>Component content</p>"}.call(this,"name"in a?a.name:"undefined"!=typeof name?name:void 0),t}}},n={};function r(t){var a=n[t];if(void 0!==a)return a.exports;var o=n[t]={exports:{}};return e[t](o,o.exports,r),o.exports}r.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return r.d(n,{a:n}),n},r.d=(e,n)=>{for(var t in n)r.o(n,t)&&!r.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:n[t]})},r.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),(()=>{"use strict";var e=r(456);r.n(e)()({name:"MyComponent"})})()})();