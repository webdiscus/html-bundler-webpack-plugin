"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[2048],{8453:(e,n,s)=>{s.d(n,{R:()=>a,x:()=>o});var t=s(6540);const i={},r=t.createContext(i);function a(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),t.createElement(r.Provider,{value:n},e.children)}},8482:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>c,contentTitle:()=>o,default:()=>p,frontMatter:()=>a,metadata:()=>t,toc:()=>l});const t=JSON.parse('{"id":"faq/using-images-in-html","title":"How to use image references in HTML","description":"Add to Webpack config the module rule:","source":"@site/docs/faq/using-images-in-html.mdx","sourceDirName":"faq","slug":"/faq/using-images-in-html","permalink":"/html-bundler-webpack-plugin/faq/using-images-in-html","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/faq/using-images-in-html.mdx","tags":[],"version":"current","sidebarPosition":83,"frontMatter":{"sidebar_position":83},"sidebar":"faqSidebar","previous":{"title":"How to keep source directory structure for assets","permalink":"/html-bundler-webpack-plugin/faq/keep-folder-structure-assets"},"next":{"title":"How to resize images","permalink":"/html-bundler-webpack-plugin/faq/responsive-image"}}');var i=s(4848),r=s(8453);const a={sidebar_position:83},o="How to use image references in HTML",c={},l=[];function d(e){const n={code:"code",h1:"h1",header:"header",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"how-to-use-image-references-in-html",children:"How to use image references in HTML"})}),"\n",(0,i.jsx)(n.p,{children:"Add to Webpack config the module rule:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-js",children:"module: {\n  rules: [\n    {\n      test: /\\.(png|jpe?g|ico|svg)$/,\n      type: 'asset/resource',\n      generator: {\n        filename: 'assets/img/[name].[hash:8][ext]', // Output image filename\n      },\n    },\n  ],\n}\n"})}),"\n",(0,i.jsx)(n.p,{children:"Add a source file using a relative path or Webpack alias in HTML:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-html",children:'<html>\n  <head>\n    <link href="./favicon.ico" rel="icon" />\n  </head>\n  <body>\n    <img src="./apple.png" srcset="./apple1.png 320w, ./apple2.png 640w" alt="apple" />\n    <picture>\n      <source srcset="./fig1.jpg, ./fig2.jpg 320w, ./fig3.jpg 640w" />\n    </picture>\n  </body>\n</html>\n'})}),"\n",(0,i.jsx)(n.p,{children:"The generated HTML contains hashed output images filenames:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-html",children:'<html>\n  <head>\n    <link href="/assets/img/favicon.05e4dd86.ico" rel="icon" />\n  </head>\n  <body>\n    <img\n      src="/assets/img/apple.f4b855d8.png"\n      srcset="/assets/img/apple1.855f4bd8.png 320w, /assets/img/apple2.d8f4b855.png 640w"\n      alt="apple" />\n    <picture>\n      <source\n        srcset="\n          /assets/img/fig1.605e4dd8.jpg,\n          /assets/img/fig2.8605e4dd.jpg 320w,\n          /assets/img/fig3.e4605dd8.jpg 640w\n        " />\n    </picture>\n  </body>\n</html>\n'})})]})}function p(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}}}]);