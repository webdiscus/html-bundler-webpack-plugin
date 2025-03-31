"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[5886],{4612:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>i,contentTitle:()=>a,default:()=>p,frontMatter:()=>r,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"guides/load-js-css-from-node-modules","title":"Load JS and CSS from package in template","description":"Some npm packages specify compiled bundle files for the browser in the package.json.","source":"@site/docs/guides/load-js-css-from-node-modules.md","sourceDirName":"guides","slug":"/guides/load-js-css-from-node-modules","permalink":"/html-bundler-webpack-plugin/guides/load-js-css-from-node-modules","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs-gh/tree/master/docs/guides/load-js-css-from-node-modules.md","tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_position":5,"title":"Load JS and CSS from package in template"},"sidebar":"guidesSidebar","previous":{"title":"Inline all assets in HTML","permalink":"/html-bundler-webpack-plugin/guides/inline-all-assets"},"next":{"title":"Import package style in SCSS","permalink":"/html-bundler-webpack-plugin/guides/import-css-from-node-modules-in-scss"}}');var o=n(4848),l=n(8453);const r={sidebar_position:5,title:"Load JS and CSS from package in template"},a="Load JS and CSS from package in template",i={},d=[];function c(e){const s={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,l.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(s.header,{children:(0,o.jsx)(s.h1,{id:"load-js-and-css-from-package-in-template",children:"Load JS and CSS from package in template"})}),"\n",(0,o.jsxs)(s.p,{children:["Some npm packages specify compiled bundle files for the browser in the ",(0,o.jsx)(s.code,{children:"package.json"}),"."]}),"\n",(0,o.jsx)(s.p,{children:"For example:"}),"\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:["the ",(0,o.jsx)(s.a,{href:"https://github.com/marella/material-icons/blob/main/package.json",children:"material-icons"})," specifies the ",(0,o.jsx)(s.code,{children:"browser ready"})," CSS file."]}),"\n",(0,o.jsxs)(s.li,{children:["the ",(0,o.jsx)(s.a,{href:"https://github.com/twbs/bootstrap/blob/main/package.json",children:"bootstrap"})," specifies the ",(0,o.jsx)(s.code,{children:"browser ready"})," JS and CSS files."]}),"\n"]}),"\n",(0,o.jsxs)(s.p,{children:["You can use only the module name, the plugin automatically resolves ",(0,o.jsx)(s.code,{children:"browser ready"})," files for script and style:"]}),"\n",(0,o.jsx)(s.pre,{children:(0,o.jsx)(s.code,{className:"language-html",children:'<html>\n<head>\n  \x3c!-- plugin resolves the bootstrap/dist/css/bootstrap.css --\x3e\n  <link href="bootstrap" rel="stylesheet">\n  \x3c!-- plugin resolves the bootstrap/dist/js/bootstrap.js --\x3e\n  <script src="bootstrap" defer="defer"><\/script>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>\n'})}),"\n",(0,o.jsx)(s.p,{children:"If you need to load a specific version of a file, use the module name and the path to that file:"}),"\n",(0,o.jsx)(s.pre,{children:(0,o.jsx)(s.code,{className:"language-html",children:'<html>\n<head>\n  <link href="bootstrap/dist/css/bootstrap.rtl.css" rel="stylesheet">\n  <script src="bootstrap/dist/js/bootstrap.bundle.js" defer="defer"><\/script>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>\n'})}),"\n",(0,o.jsxs)(s.blockquote,{children:["\n",(0,o.jsx)(s.admonition,{type:"warning",children:(0,o.jsxs)(s.p,{children:["Don't use a relative path to ",(0,o.jsx)(s.code,{children:"node_modules"}),", like ",(0,o.jsx)(s.code,{children:"../node_modules/bootstrap"}),". The plugin resolves node module path by the name automatically."]})}),"\n"]})]})}function p(e={}){const{wrapper:s}={...(0,l.R)(),...e.components};return s?(0,o.jsx)(s,{...e,children:(0,o.jsx)(c,{...e})}):c(e)}},8453:(e,s,n)=>{n.d(s,{R:()=>r,x:()=>a});var t=n(6540);const o={},l=t.createContext(o);function r(e){const s=t.useContext(l);return t.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function a(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),t.createElement(l.Provider,{value:s},e.children)}}}]);