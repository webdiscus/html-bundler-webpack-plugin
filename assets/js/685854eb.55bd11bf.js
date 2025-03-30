"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9436],{7824:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>r,contentTitle:()=>c,default:()=>h,frontMatter:()=>l,metadata:()=>t,toc:()=>a});const t=JSON.parse('{"id":"faq/split-chunks","title":"How to configure splitChunks","description":"Webpack tries to split every entry file, include template files, which completely breaks the compilation process in the plugin.","source":"@site/docs/faq/split-chunks.md","sourceDirName":"faq","slug":"/faq/split-chunks","permalink":"/html-bundler-webpack-plugin/faq/split-chunks","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/docs/faq/split-chunks.md","tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_position":5},"sidebar":"faqSidebar","previous":{"title":"How to split CSS files","permalink":"/html-bundler-webpack-plugin/faq/split-css"},"next":{"title":"How to keep package name for split chunks","permalink":"/html-bundler-webpack-plugin/faq/split-chunks-keep-module-name"}}');var i=s(4848),o=s(8453);const l={sidebar_position:5},c="How to configure splitChunks",r={},a=[];function p(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",header:"header",p:"p",pre:"pre",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsxs)(n.h1,{id:"how-to-configure-splitchunks",children:["How to configure ",(0,i.jsx)(n.code,{children:"splitChunks"})]})}),"\n",(0,i.jsx)(n.p,{children:"Webpack tries to split every entry file, include template files, which completely breaks the compilation process in the plugin."}),"\n",(0,i.jsxs)(n.p,{children:["To avoid this issue, you must specify which scripts should be split, using ",(0,i.jsx)(n.code,{children:"optimization.splitChunks.cacheGroups"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-diff",children:"module.exports = {\n  optimization: {\n    splitChunks: {\n-     chunks: 'all', // <= DO NOT use this here\n      cacheGroups: {\n        scripts: {\n          test: /\\.(js|ts)$/, // <= IMPORTANT: split only script files\n+         chunks: 'all', // <= DEFINE it here only\n        },\n      },\n    },\n  },\n};\n"})}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsx)(n.admonition,{type:"note",children:(0,i.jsxs)(n.p,{children:["In the ",(0,i.jsx)(n.code,{children:"test"})," option must be specified all extensions of scripts which should be split."]})}),"\n"]}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.admonition,{type:"warning",children:[(0,i.jsxs)(n.p,{children:["DO NOT use the ",(0,i.jsx)(n.code,{children:"chunks: 'all'"})," option globally!"]}),(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"splitChunks.chunks: 'all'"})," option splits all types of chunks, but it make no sense, because we need split only scripts.\nTemplates, CSS, images and other assets can't be split."]}),(0,i.jsxs)(n.p,{children:["Define ",(0,i.jsx)(n.code,{children:"chunks: 'all'"})," only in a cache group where is specified the ",(0,i.jsx)(n.code,{children:"test"})," option for your scripts."]}),(0,i.jsxs)(n.p,{children:["\u203c\ufe0f The ",(0,i.jsx)(n.code,{children:"splitChunks.chunks"})," option will be automatically removed, because some assets can't be resolved or output files may be corrupted!"]})]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["See details by ",(0,i.jsx)(n.a,{href:"https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroups",children:"splitChunks.cacheGroups"}),"."]}),"\n",(0,i.jsxs)(n.p,{children:["For example, in a template are used the scripts and styles from ",(0,i.jsx)(n.code,{children:"node_modules"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-html",children:'<html>\n  <head>\n    <title>Home</title>\n    <link href="bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />\n    <script src="bootstrap/dist/js/bootstrap.min.js" defer="defer"><\/script>\n  </head>\n  <body>\n    <h1>Hello World!</h1>\n    <script src="./main.js"><\/script>\n  </body>\n</html>\n'})}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsx)(n.admonition,{type:"note",children:(0,i.jsx)(n.p,{children:"In the generated HTML, all script tags remain in their original places, and the split chunks will be added there\nin the order in which Webpack generated them."})}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["In this use case the ",(0,i.jsx)(n.code,{children:"optimization.splitChunks.cacheGroups.{cacheGroup}.test"})," option must match exactly only JS files from ",(0,i.jsx)(n.code,{children:"node_modules"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-js",children:"module.exports = {\n  optimization: {\n    runtimeChunk: 'single',\n    splitChunks: {\n      cacheGroups: {\n        vendor: {\n          test: /[\\\\/]node_modules[\\\\/].+\\.(js|ts)$/, // <= IMPORTANT: split only script files\n          chunks: 'all', // <= DEFINE it here only\n        },\n      },\n    },\n  },\n};\n"})}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsx)(n.admonition,{type:"warning",children:(0,i.jsxs)(n.p,{children:["If you will to use the ",(0,i.jsx)(n.code,{children:"test"})," as ",(0,i.jsx)(n.code,{children:"/[\\\\/]node_modules[\\\\/]"}),", without extension specification,\nthen Webpack concatenates JS code together with CSS in one file and Webpack compilation will failed or generate files with a wrong content.\nWebpack can't differentiate CSS module from JS module, therefore you MUST match only JS files."]})}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(p,{...e})}):p(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>l,x:()=>c});var t=s(6540);const i={},o=t.createContext(i);function l(e){const n=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),t.createElement(o.Provider,{value:n},e.children)}}}]);