"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[5433],{8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>l});var i=t(6540);const r={},s=i.createContext(r);function o(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),i.createElement(s.Provider,{value:n},e.children)}},9091:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>l,default:()=>c,frontMatter:()=>o,metadata:()=>i,toc:()=>p});const i=JSON.parse('{"id":"Options/PluginOptions/renderStage","title":"renderStage","description":"Option: renderStage","source":"@site/docs/Options/PluginOptions/renderStage.mdx","sourceDirName":"Options/PluginOptions","slug":"/plugin-options-renderStage","permalink":"/html-bundler-webpack-plugin/plugin-options-renderStage","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/Options/PluginOptions/renderStage.mdx","tags":[{"inline":true,"label":"HTML","permalink":"/html-bundler-webpack-plugin/tags/html"},{"inline":true,"label":"template","permalink":"/html-bundler-webpack-plugin/tags/template"},{"inline":true,"label":"renderStage","permalink":"/html-bundler-webpack-plugin/tags/render-stage"}],"version":"current","sidebarPosition":170,"frontMatter":{"sidebar_position":170,"slug":"/plugin-options-renderStage","title":"renderStage","tags":["HTML","template","renderStage"]},"sidebar":"docsSidebar","previous":{"title":"afterEmit","permalink":"/html-bundler-webpack-plugin/plugin-options-afterEmit"},"next":{"title":"integrity","permalink":"/html-bundler-webpack-plugin/plugin-options-integrity"}}');var r=t(4848),s=t(8453);const o={sidebar_position:170,slug:"/plugin-options-renderStage",title:"renderStage",tags:["HTML","template","renderStage"]},l="Render stage",a={},p=[];function d(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",header:"header",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"render-stage",children:"Render stage"})}),"\n",(0,r.jsxs)(n.p,{children:["Option: ",(0,r.jsx)(n.code,{children:"renderStage"})]}),"\n",(0,r.jsxs)(n.p,{children:["Type: ",(0,r.jsx)(n.code,{children:"null | number"})]}),"\n",(0,r.jsxs)(n.p,{children:["Default: ",(0,r.jsx)(n.code,{children:"Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER - 1"})]}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.a,{href:"https://webpack.js.org/api/compilation-hooks/#list-of-asset-processing-stages",children:"stage"})," to render output HTML in the ",(0,r.jsx)(n.a,{href:"https://webpack.js.org/api/compilation-hooks/#processassets",children:"processAssets"})," Webpack hook."]}),"\n",(0,r.jsx)(n.p,{children:"For example:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"const path = require('path');\nconst Compilation = require('webpack/lib/Compilation');\nconst HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\nconst CompressionPlugin = require('compression-webpack-plugin');\n\nmodule.exports = {\n  mode: 'production',\n  output: {\n    path: path.join(__dirname, 'dist/'),\n  },\n  plugins: [\n    new CompressionPlugin(),\n    new HtmlBundlerPlugin({\n      entry: {\n        index: 'src/index.html',\n      },\n      // ensures that the CompressionPlugin save the resulting HTML into the `*.html.gz` file\n      // after the rendering process in the HtmlBundlerPlugin\n      renderStage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH + 1,\n    }),\n  ],\n};\n\n"})}),"\n",(0,r.jsx)(n.p,{children:"Other example with an optimization plugin:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"const path = require('path');\nconst Compilation = require('webpack/lib/Compilation');\nconst HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\nconst HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');\n\nmodule.exports = {\n  mode: 'production',\n  output: {\n    path: path.join(__dirname, 'dist/'),\n  },\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: 'src/index.html',\n      },\n      // ensures that the HTML rendering is called right before the HtmlMinimizerPlugin\n      renderStage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE - 1,\n    }),\n  ],\n  optimization: {\n    minimizer: [\n      // this plugin is called at the PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE stage\n      new HtmlMinimizerPlugin({}),\n    ],\n  },\n};\n\n"})}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsx)(n.admonition,{type:"tip",children:(0,r.jsxs)(n.p,{children:["To ensures that the rendering process will be run after all optimizations and after all other plugins\nset the ",(0,r.jsx)(n.code,{children:"renderStage: Infinity + 1"}),"."]})}),"\n"]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsx)(n.admonition,{type:"caution",children:(0,r.jsxs)(n.p,{children:["Use this option only to order the sequence of asset processing across multiple plugins that use the same ",(0,r.jsx)(n.a,{href:"https://webpack.js.org/api/compilation-hooks/#processassets",children:"processAssets"})," hook."]})}),"\n"]})]})}function c(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}}}]);