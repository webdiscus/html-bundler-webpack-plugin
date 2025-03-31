"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[9783],{766:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>a,default:()=>u,frontMatter:()=>r,metadata:()=>s,toc:()=>d});const s=JSON.parse('{"id":"guides/inline-images","title":"Inline images in HTML","description":"You can inline the images in two ways:","source":"@site/docs/guides/inline-images.md","sourceDirName":"guides","slug":"/guides/inline-images","permalink":"/html-bundler-webpack-plugin/guides/inline-images","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/guides/inline-images.md","tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4},"sidebar":"guidesSidebar","previous":{"title":"Inline JS in HTML","permalink":"/html-bundler-webpack-plugin/guides/inline-js"},"next":{"title":"Lazy loading CSS","permalink":"/html-bundler-webpack-plugin/guides/dynamic-load-css"}}');var t=i(4848),l=i(8453);const r={sidebar_position:4},a="Inline images in HTML",o={},d=[];function c(e){const n={a:"a",code:"code",h1:"h1",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,l.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"inline-images-in-html",children:"Inline images in HTML"})}),"\n",(0,t.jsx)(n.p,{children:"You can inline the images in two ways:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"auto inline by image size"}),"\n",(0,t.jsxs)(n.li,{children:["force inline image using ",(0,t.jsx)(n.code,{children:"?inline"})," query (works in HTML, CSS, ",(0,t.jsx)(n.a,{href:"/guides/import-svg-in-js",children:"JS"}),")"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Add to Webpack config the rule:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"module: {\n  rules: [\n    {\n      test: /\\.(png|jpe?g|svg|webp|ico)$/i,\n      // auto inline by image size\n      {\n        type: 'asset',\n        parser: {\n          dataUrlCondition: {\n            maxSize: 1024,\n          },\n        },\n        generator: {\n          filename: 'assets/img/[name].[hash:8][ext]',\n        },\n      },\n    },\n  ],\n}\n"})}),"\n",(0,t.jsxs)(n.p,{children:["The plugin automatically inline images smaller then ",(0,t.jsx)(n.code,{children:"maxSize"}),"."]})]})}function u(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>a});var s=i(6540);const t={},l=s.createContext(t);function r(e){const n=s.useContext(l);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),s.createElement(l.Provider,{value:n},e.children)}}}]);