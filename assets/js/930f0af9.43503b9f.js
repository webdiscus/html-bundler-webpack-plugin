"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[5091],{3680:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>a,contentTitle:()=>o,default:()=>u,frontMatter:()=>l,metadata:()=>r,toc:()=>c});const r=JSON.parse('{"id":"guides/resolve-image-in-href","title":"Resolve image in href","description":"For example, you want to link a small image as a preview to open the full-size image in a new tab or pop-up window.","source":"@site/docs/guides/resolve-image-in-href.md","sourceDirName":"guides","slug":"/guides/resolve-image-in-href","permalink":"/html-bundler-webpack-plugin/guides/resolve-image-in-href","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/guides/resolve-image-in-href.md","tags":[],"version":"current","sidebarPosition":7,"frontMatter":{"sidebar_position":7,"title":"Resolve image in href"},"sidebar":"guidesSidebar","previous":{"title":"Resolve image in style attribute","permalink":"/html-bundler-webpack-plugin/guides/resolve-attr-style-url"},"next":{"title":"Provide external data in template","permalink":"/html-bundler-webpack-plugin/guides/external-data-in-template"}}');var t=i(4848),s=i(8453);const l={sidebar_position:7,title:"Resolve image in href"},o="Resolve image reference in href",a={},c=[{value:"Problem",id:"problem",level:3},{value:"Solution",id:"solution",level:3}];function d(e){const n={a:"a",code:"code",h1:"h1",h3:"h3",header:"header",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"resolve-image-reference-in-href",children:"Resolve image reference in href"})}),"\n",(0,t.jsx)(n.p,{children:"For example, you want to link a small image as a preview to open the full-size image in a new tab or pop-up window."}),"\n",(0,t.jsx)(n.p,{children:"A typical example:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-html",children:'\x3c!-- href contains HTML file --\x3e\n<a href="index.html">home</a> | <a href="about.html">about</a>\n\n\x3c!-- href contains image file, which should be resolved --\x3e\n<a href="./images/cat-fullsize.jpg" target="_blank">\n   <img src="./images/cat-preview.jpg" />\n</a>\n'})}),"\n",(0,t.jsxs)(n.p,{children:["To resolve images in the ",(0,t.jsx)(n.code,{children:"href"})," attribute of a tag, just enable it using the ",(0,t.jsx)(n.a,{href:"/plugin-options-sources",children:"loaderOptions.sources"})," option."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"loaderOptions: {\n  sources: [\n    {\n      tag: 'a',\n      attributes: ['href'],\n    },\n  ],\n},\n"})}),"\n",(0,t.jsx)(n.h3,{id:"problem",children:"Problem"}),"\n",(0,t.jsxs)(n.p,{children:["All ",(0,t.jsx)(n.code,{children:"href"})," attributes of all ",(0,t.jsx)(n.code,{children:"<a>"})," tags will now be resolved,\nwhich could cause an error if the ",(0,t.jsx)(n.code,{children:"href"})," contained an HTML file, e.g. ",(0,t.jsx)(n.code,{children:'<a href="index.html">'}),"."]}),"\n",(0,t.jsx)(n.h3,{id:"solution",children:"Solution"}),"\n",(0,t.jsxs)(n.p,{children:["Use the ",(0,t.jsx)(n.a,{href:"/plugin-options-sources#filter-function",children:"filter"})," function to avoid resolving non-image files."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"loaderOptions: {\n  sources: [\n    {\n      tag: 'a',\n      attributes: ['href'],\n      filter: ({ value }) => !value.endsWith('.html'), // return false to ignore *.html files\n    },\n  ],\n},\n"})})]})}function u(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>l,x:()=>o});var r=i(6540);const t={},s=r.createContext(t);function l(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:l(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);