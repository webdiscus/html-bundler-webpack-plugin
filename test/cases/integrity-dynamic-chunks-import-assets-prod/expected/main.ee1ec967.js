(()=>{"use strict";var e,t,r,o={},n={};function i(e){var t=n[e];if(void 0!==t)return t.exports;var r=n[e]={exports:{}};return o[e](r,r.exports,i),r.exports}i.m=o,i.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return i.d(t,{a:t}),t},t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,i.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var n=Object.create(null);i.r(n);var a={};e=e||[null,t({}),t([]),t(t)];for(var c=2&o&&r;"object"==typeof c&&!~e.indexOf(c);c=t(c))Object.getOwnPropertyNames(c).forEach((e=>a[e]=()=>r[e]));return a.default=()=>r,i.d(n,a),n},i.d=(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.f={},i.e=e=>Promise.all(Object.keys(i.f).reduce(((t,r)=>(i.f[r](e,t),t)),[])),i.u=e=>e+".js",i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r={},i.l=(e,t,o,n)=>{if(r[e])r[e].push(t);else{var a,c;if(void 0!==o)for(var s=document.getElementsByTagName("script"),u=0;u<s.length;u++){var l=s[u];if(l.getAttribute("src")==e){a=l;break}}a||(c=!0,(a=document.createElement("script")).charset="utf-8",a.timeout=120,i.nc&&a.setAttribute("nonce",i.nc),a.src=e,0!==a.src.indexOf(window.location.origin+"/")&&(a.crossOrigin="anonymous"),a.integrity=i.integrity[n],a.crossOrigin="anonymous"),r[e]=[t];var d=(t,o)=>{a.onerror=a.onload=null,clearTimeout(f);var n=r[e];if(delete r[e],a.parentNode&&a.parentNode.removeChild(a),n&&n.forEach((e=>e(o))),t)return t(o)},f=setTimeout(d.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=d.bind(null,a.onerror),a.onload=d.bind(null,a.onload),c&&document.head.appendChild(a)}},i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;i.g.importScripts&&(e=i.g.location+"");var t=i.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");if(r.length)for(var o=r.length-1;o>-1&&(!e||!/^http(s?):/.test(e));)e=r[o--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),i.p=e})(),i.integrity={71:"sha384-dUVR72pfcX5glzpmRocOOifwpsNke6Udsf2BSLgTSvMHLlXX+TD36IQc9NzVTNCI",170:"sha384-3DGNP3Ur7ixKHlM8XjB8sqkuI/wF4ApCUqwxwIdKRG9gCffMMUmpHhIUNon8UBaT",473:"sha384-3VnZ/DvPvH0qFhtfnzIUCc4KrwxBkgKprfwfpfluqlx1Y2p+rGZEfXDvrPAGoVn+"},(()=>{var e={792:0};i.f.j=(t,r)=>{var o=i.o(e,t)?e[t]:void 0;if(0!==o)if(o)r.push(o[2]);else{var n=new Promise(((r,n)=>o=e[t]=[r,n]));r.push(o[2]=n);var a=i.p+i.u(t),c=new Error;i.l(a,(r=>{if(i.o(e,t)&&(0!==(o=e[t])&&(e[t]=void 0),o)){var n=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.src;c.message="Loading chunk "+t+" failed.\n("+n+": "+a+")",c.name="ChunkLoadError",c.type=n,c.request=a,o[1](c)}}),"chunk-"+t,t)}};var t=(t,r)=>{var o,n,[a,c,s]=r,u=0;if(a.some((t=>0!==e[t]))){for(o in c)i.o(c,o)&&(i.m[o]=c[o]);s&&s(i)}for(t&&t(r);u<a.length;u++)n=a[u],i.o(e,n)&&e[n]&&e[n][0](),e[n]=0},r=self.webpackChunk=self.webpackChunk||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})();const a=[];new MutationObserver((e=>{for(const{addedNodes:t=[]}of e)for(const e of t)"SCRIPT"===e.nodeName&&e.getAttribute("integrity")&&a.push(e)})).observe(document.querySelector("head"),{childList:!0}),i.e(473).then(i.bind(i,473)).then((()=>{a.forEach((e=>{const{src:t,integrity:r,crossOrigin:o}=e;let n=t.split("/").pop();const i=document.createElement("p"),a=`Dynamic chunk "${n}" is loaded!`;i.innerHTML=`<h2>${a}</h2><div><b>integrity:</b> ${r}</div><div><b>crossOrigin</b>: ${o}</div>`,document.body.append(i),console.log(`--\x3e ${a}`,e)}))})).catch((e=>{console.log("import chunk error: ",e)})),i.e(71).then(i.t.bind(i,71,23)),i.e(170).then(i.t.bind(i,170,23)),console.log(">> main")})();
//# sourceMappingURL=main.ee1ec967.js.map