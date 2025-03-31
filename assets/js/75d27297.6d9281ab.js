"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[5058,8834],{1687:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>a,default:()=>d,frontMatter:()=>r,metadata:()=>s,toc:()=>u});const s=JSON.parse('{"id":"Options/PluginOptions/filename","title":"filename","description":"Option: filename","source":"@site/docs/Options/PluginOptions/filename.mdx","sourceDirName":"Options/PluginOptions","slug":"/plugin-options-filename","permalink":"/html-bundler-webpack-plugin/plugin-options-filename","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/Options/PluginOptions/filename.mdx","tags":[{"inline":true,"label":"HTML","permalink":"/html-bundler-webpack-plugin/tags/html"},{"inline":true,"label":"output","permalink":"/html-bundler-webpack-plugin/tags/output"},{"inline":true,"label":"filename","permalink":"/html-bundler-webpack-plugin/tags/filename"}],"version":"current","sidebarPosition":91,"frontMatter":{"sidebar_position":91,"slug":"/plugin-options-filename","title":"filename","tags":["HTML","output","filename"]},"sidebar":"docsSidebar","previous":{"title":"sources","permalink":"/html-bundler-webpack-plugin/plugin-options-sources"},"next":{"title":"outputPath","permalink":"/html-bundler-webpack-plugin/plugin-options-outputPath"}}');var i=t(4848),l=t(8453);t(2978);const r={sidebar_position:91,slug:"/plugin-options-filename",title:"filename",tags:["HTML","output","filename"]},a="Output HTML filename",o={},u=[{value:"Output Filename Template",id:"output-filename-template",level:2},{value:"Custom Processing Function",id:"custom-processing-function",level:2},{value:"Related Resources",id:"related-resources",level:2}];function c(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,l.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"output-html-filename",children:"Output HTML filename"})}),"\n",(0,i.jsxs)(n.p,{children:["Option: ",(0,i.jsx)(n.code,{children:"filename"})]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"type filename = string | ((pathData: PathData, assetInfo: AssetInfo) => string);\n"})}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Default:"})," ",(0,i.jsx)(n.code,{children:"[name].html"})]}),"\n",(0,i.jsxs)(n.p,{children:["Defines the HTML output filename relative to the ",(0,i.jsx)(n.a,{href:"/plugin-options-outputPath",children:(0,i.jsx)(n.code,{children:"outputPath"})})," configuration.\nTemplate-specific ",(0,i.jsx)(n.a,{href:"/plugin-options-entry#entrydescription",children:"filename"})," configuration overrides this option."]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Valid values"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"string"})," Output filename template."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"Function"})," Custom processing function."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"output-filename-template",children:"Output Filename Template"}),"\n",(0,i.jsxs)(n.p,{children:["Type: ",(0,i.jsx)(n.code,{children:"string"})]}),"\n",(0,i.jsx)(n.p,{children:"Specifies the output filename template."}),"\n",(0,i.jsx)(n.p,{children:"Supports following Webpack substitutions:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"[id]"}),": The chunk ID."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"[name]"}),": The filename without extension or path."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"[contenthash]"}),": The content hash (default length: 20)."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"[contenthash:nn]"}),": Custom hash length (replace ",(0,i.jsx)(n.code,{children:"nn"})," with desired length)."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"custom-processing-function",children:"Custom Processing Function"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"function (pathData: PathData, assetInfo: AssetInfo) => string\n"})}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Parameters"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"pathData"}),": Contextual information about the asset path"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"assetInfo"}),": Additional metadata about the Webpack asset"]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Returns"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"string"})," Output filename template."]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Webpack Type Definitions"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"type PathData = {\n  hash: string;\n  hashWithLength: (number) => string;\n  chunk: Chunk | ChunkPathData;\n  module: Module | ModulePathData;\n  contentHashType: string;\n  contentHash: string;\n  contentHashWithLength: (number) => string;\n  filename: string;\n  url: string;\n  runtime: string | SortableSet<string>;\n  chunkGraph: ChunkGraph;\n};\n"})}),"\n",(0,i.jsx)(n.h2,{id:"related-resources",children:"Related Resources"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://webpack.js.org/configuration/output/#template-strings",children:"Webpack filename templates"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsxs)(n.a,{href:"https://webpack.js.org/configuration/output/#outputfilename",children:["Webpack ",(0,i.jsx)(n.code,{children:"output.filename"})]})}),"\n"]})]})}function d(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},2978:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>a,default:()=>d,frontMatter:()=>r,metadata:()=>s,toc:()=>u});const s=JSON.parse('{"id":"partials/tip-default","title":"tip-default","description":"If you\'re unsure about its purpose, simply don\'t set this option. The default value will be used.","source":"@site/docs/partials/tip-default.md","sourceDirName":"partials","slug":"/partials/tip-default","permalink":"/html-bundler-webpack-plugin/partials/tip-default","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/partials/tip-default.md","tags":[],"version":"current","frontMatter":{}}');var i=t(4848),l=t(8453);const r={},a=void 0,o={},u=[];function c(e){const n={admonition:"admonition",blockquote:"blockquote",p:"p",...(0,l.R)(),...e.components};return(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsx)(n.p,{children:"If you're unsure about its purpose, simply don't set this option. The default value will be used."})}),"\n"]})}function d(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>r,x:()=>a});var s=t(6540);const i={},l=s.createContext(i);function r(e){const n=s.useContext(l);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),s.createElement(l.Provider,{value:n},e.children)}}}]);