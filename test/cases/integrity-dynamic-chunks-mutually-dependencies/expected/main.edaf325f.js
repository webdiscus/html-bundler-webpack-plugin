(()=>{var e,t,r,o={},n={};function i(e){var t=n[e];if(void 0!==t)return t.exports;var r=n[e]={exports:{}};return o[e](r,r.exports,i),r.exports}i.m=o,t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,i.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var n=Object.create(null);i.r(n);var c={};e=e||[null,t({}),t([]),t(t)];for(var a=2&o&&r;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>c[e]=()=>r[e]));return c.default=()=>r,i.d(n,c),n},i.d=(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.f={},i.e=e=>Promise.all(Object.keys(i.f).reduce(((t,r)=>(i.f[r](e,t),t)),[])),i.u=e=>e+".js",i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r={},i.l=(e,t,o,n)=>{if(r[e])r[e].push(t);else{var c,a;if(void 0!==o)for(var s=document.getElementsByTagName("script"),l=0;l<s.length;l++){var u=s[l];if(u.getAttribute("src")==e){c=u;break}}c||(a=!0,(c=document.createElement("script")).charset="utf-8",c.timeout=120,i.nc&&c.setAttribute("nonce",i.nc),c.src=e,0!==c.src.indexOf(window.location.origin+"/")&&(c.crossOrigin="anonymous"),c.integrity=i.integrity[n],c.crossOrigin="anonymous"),r[e]=[t];var d=(t,o)=>{c.onerror=c.onload=null,clearTimeout(f);var n=r[e];if(delete r[e],c.parentNode&&c.parentNode.removeChild(c),n&&n.forEach((e=>e(o))),t)return t(o)},f=setTimeout(d.bind(null,void 0,{type:"timeout",target:c}),12e4);c.onerror=d.bind(null,c.onerror),c.onload=d.bind(null,c.onload),a&&document.head.appendChild(c)}},i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;i.g.importScripts&&(e=i.g.location+"");var t=i.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");if(r.length)for(var o=r.length-1;o>-1&&(!e||!/^http(s?):/.test(e));)e=r[o--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),i.p=e})(),i.integrity={57:"sha384-mJwXB/0MiZk9HaPs8hzUin9JrrshpLkMxuMi8WMBaB1wUIqQYBKScIhg4Sa6S3bd",71:"sha384-oa3D+W34UIBOs9c8qHh3BEIlUryV97+1iHfWuOD/tYx4ipo+QHtg0XjIFi7PBWm1",170:"sha384-L54stIjRcDLL+rde6eQfrPfdt7Okc7fK/4ImEgu1oB0Ovlv8K2rTDxzQ2AyzYmEY"},(()=>{var e={792:0};i.f.j=(t,r)=>{var o=i.o(e,t)?e[t]:void 0;if(0!==o)if(o)r.push(o[2]);else{var n=new Promise(((r,n)=>o=e[t]=[r,n]));r.push(o[2]=n);var c=i.p+i.u(t),a=new Error;i.l(c,(r=>{if(i.o(e,t)&&(0!==(o=e[t])&&(e[t]=void 0),o)){var n=r&&("load"===r.type?"missing":r.type),c=r&&r.target&&r.target.src;a.message="Loading chunk "+t+" failed.\n("+n+": "+c+")",a.name="ChunkLoadError",a.type=n,a.request=c,o[1](a)}}),"chunk-"+t,t)}};var t=(t,r)=>{var o,n,[c,a,s]=r,l=0;if(c.some((t=>0!==e[t]))){for(o in a)i.o(a,o)&&(i.m[o]=a[o]);s&&s(i)}for(t&&t(r);l<c.length;l++)n=c[l],i.o(e,n)&&e[n]&&e[n][0](),e[n]=0},r=self.webpackChunk=self.webpackChunk||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})();const c=[];new MutationObserver((e=>{for(const{addedNodes:t=[]}of e)for(const e of t)"SCRIPT"===e.nodeName&&e.getAttribute("integrity")&&c.push(e)})).observe(document.querySelector("head"),{childList:!0}),i.e(71).then(i.t.bind(i,71,23)).then((()=>{setTimeout((()=>{c.forEach((e=>{const{src:t,integrity:r,crossOrigin:o}=e;let n=t.split("/").pop();const i=document.createElement("p"),c=`Dynamic chunk "${n}" is loaded!`;i.innerHTML=`<h2>${c}</h2><div><b>integrity:</b> ${r}</div><div><b>crossOrigin</b>: ${o}</div>`,document.body.append(i),console.log(`--\x3e ${c}`,e)}))}),200)})).catch((e=>{console.log("import chunk error: ",e)})),console.log(">> main")})();