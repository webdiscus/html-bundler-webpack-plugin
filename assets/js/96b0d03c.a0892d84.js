"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[8602],{1563:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>c,contentTitle:()=>i,default:()=>h,frontMatter:()=>l,metadata:()=>n,toc:()=>a});const n=JSON.parse('{"id":"guides/import-css-style-sheet","title":"Import CSS stylesheet in JS","description":"Using the css-loader option exportType as css-style-sheet","source":"@site/docs/guides/import-css-style-sheet.md","sourceDirName":"guides","slug":"/guides/import-css-style-sheet","permalink":"/html-bundler-webpack-plugin/guides/import-css-style-sheet","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs-gh/tree/master/docs/guides/import-css-style-sheet.md","tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_position":5},"sidebar":"guidesSidebar","previous":{"title":"Import CSS classes in JS","permalink":"/html-bundler-webpack-plugin/guides/import-css-class-names"},"next":{"title":"Import SVG in JS","permalink":"/html-bundler-webpack-plugin/guides/import-svg-in-js"}}');var o=t(4848),r=t(8453);const l={sidebar_position:5},i="Import CSS stylesheet in JS",c={},a=[];function d(e){const s={a:"a",code:"code",h1:"h1",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,r.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(s.header,{children:(0,o.jsx)(s.h1,{id:"import-css-stylesheet-in-js",children:"Import CSS stylesheet in JS"})}),"\n",(0,o.jsxs)(s.p,{children:["Using the ",(0,o.jsx)(s.code,{children:"css-loader"})," option ",(0,o.jsx)(s.a,{href:"https://github.com/webpack-contrib/css-loader?#exporttype",children:"exportType"})," as ",(0,o.jsx)(s.code,{children:"css-style-sheet"}),"\nyou can import the CSS stylesheets as the instance of the ",(0,o.jsx)(s.a,{href:"https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet",children:"CSSStyleSheet"})," object."]}),"\n",(0,o.jsx)(s.p,{children:"Import a CSS module script and apply it to a document or a shadow root like this:"}),"\n",(0,o.jsx)(s.pre,{children:(0,o.jsx)(s.code,{className:"language-js",children:"import sheet from './style.scss?sheet';\n\ndocument.adoptedStyleSheets = [sheet];\nshadowRoot.adoptedStyleSheets = [sheet];\n"})}),"\n",(0,o.jsxs)(s.p,{children:["You can use the ",(0,o.jsx)(s.code,{children:"?sheet"})," URL query to import a style file as stylesheets.\nThe query must be configured in the webpack config:"]}),"\n",(0,o.jsx)(s.pre,{children:(0,o.jsx)(s.code,{className:"language-js",children:"module.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: './src/index.html',\n      },\n      js: {\n        filename: '[name].[contenthash:8].js',\n      },\n      css: {\n        filename: '[name].[contenthash:8].css',\n      },\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.(s?css)$/,\n        oneOf: [\n          // Import CSS/SCSS source file as a CSSStyleSheet object\n          {\n            resourceQuery: /sheet/, // <= the query, e.g. style.scss?sheet\n            use: [\n              {\n                loader: 'css-loader',\n                options: {\n                  exportType: 'css-style-sheet', // <= define this option\n                },\n              },\n              {\n                loader: 'sass-loader',\n              },\n            ],\n          },\n          // Import CSS/SCSS source file as a CSS string\n          {\n            use: [\n              'css-loader',\n              'sass-loader',\n            ],\n          }\n        ],\n      }\n    ],\n  },\n};\n"})}),"\n",(0,o.jsx)(s.p,{children:"Using the universal configuration above you can apply CSS stylesheets in JS and extract CSS into separate file or inject CSS into HTML:"}),"\n",(0,o.jsx)(s.pre,{children:(0,o.jsx)(s.code,{className:"language-js",children:"import sheet from './style.scss?sheet'; // import as CSSStyleSheet object\nimport './style2.scss?inline'; // the extracted CSS will be injected into HTML\nimport './style3.scss'; // the extracted CSS will be saved into separate output file\n\n// apply stylesheet to document and shadow root\ndocument.adoptedStyleSheets = [sheet];\nshadowRoot.adoptedStyleSheets = [sheet];\n"})}),"\n",(0,o.jsxs)(s.p,{children:["This is useful for ",(0,o.jsx)(s.a,{href:"https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements",children:"custom elements"})," and shadow DOM."]}),"\n",(0,o.jsx)(s.p,{children:"More information:"}),"\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.a,{href:"https://web.dev/css-module-scripts/",children:"Using CSS Module Scripts to import stylesheets"})}),"\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.a,{href:"https://developers.google.com/web/updates/2019/02/constructable-stylesheets",children:"Constructable Stylesheets: seamless reusable styles"})}),"\n"]})]})}function h(e={}){const{wrapper:s}={...(0,r.R)(),...e.components};return s?(0,o.jsx)(s,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,s,t)=>{t.d(s,{R:()=>l,x:()=>i});var n=t(6540);const o={},r=n.createContext(o);function l(e){const s=n.useContext(r);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function i(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:l(e.components),n.createElement(r.Provider,{value:s},e.children)}}}]);