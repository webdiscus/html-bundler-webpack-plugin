"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[8248],{8324:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>l,contentTitle:()=>c,default:()=>d,frontMatter:()=>r,metadata:()=>t,toc:()=>p});const t=JSON.parse('{"id":"Options/PluginOptions/postprocess","title":"postprocess (for HTML)","description":"Option: postprocess\\\\","source":"@site/docs/Options/PluginOptions/postprocess.mdx","sourceDirName":"Options/PluginOptions","slug":"/Options/PluginOptions/postprocess","permalink":"/html-bundler-webpack-plugin/Options/PluginOptions/postprocess","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/docs/Options/PluginOptions/postprocess.mdx","tags":[],"version":"current","sidebarPosition":140,"frontMatter":{"sidebar_position":140,"title":"postprocess (for HTML)"},"sidebar":"docsSidebar","previous":{"title":"preprocessorOptions","permalink":"/html-bundler-webpack-plugin/Options/PluginOptions/preprocessorOptions"},"next":{"title":"beforeEmit (for HTML)","permalink":"/html-bundler-webpack-plugin/Options/PluginOptions/beforeEmit"}}');var o=s(4848),i=s(8453);const r={sidebar_position:140,title:"postprocess (for HTML)"},c="Callback postprocess",l={},p=[];function a(e){const n={a:"a",br:"br",code:"code",h1:"h1",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,i.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.header,{children:(0,o.jsx)(n.h1,{id:"callback-postprocess",children:"Callback postprocess"})}),"\n",(0,o.jsxs)(n.p,{children:["Option: ",(0,o.jsx)(n.code,{children:"postprocess"}),(0,o.jsx)(n.br,{}),"\n","Affects: Generated HTML"]}),"\n",(0,o.jsx)(n.p,{children:"Type:"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-ts",children:"type postprocess = (\n  content: string,\n  info: TemplateInfo,\n  compilation: Compilation\n) => string | undefined;\n\ntype TemplateInfo = {\n  name: string;\n  assetFile: string;\n  sourceFile: string;\n  resource: string;\n  outputPath: string;\n};\n"})}),"\n",(0,o.jsxs)(n.p,{children:["Default: ",(0,o.jsx)(n.code,{children:"null"})]}),"\n",(0,o.jsx)(n.p,{children:"Called after the template has been compiled, but not yet finalized, before injection of the split chunks and inline assets."}),"\n",(0,o.jsxs)(n.p,{children:["The ",(0,o.jsx)(n.code,{children:"postprocess"})," have the following arguments:"]}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"content: string"})," - a content of processed file"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"info: TemplateInfo"})," - info about current file"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"compilation: Compilation"})," - the Webpack ",(0,o.jsx)(n.a,{href:"https://webpack.js.org/api/compilation-object/",children:"compilation object"})]}),"\n"]}),"\n",(0,o.jsxs)(n.p,{children:["The ",(0,o.jsx)(n.code,{children:"TemplateInfo"})," have the following properties:"]}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"name: string"})," - the entry name"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"assetFile: string"})," - the output asset filename relative to ",(0,o.jsx)(n.code,{children:"outputPath"})]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"sourceFile: string"})," - the absolute path of the source file, without a query"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"resource: string"})," - the absolute path of the source file, including a query"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"outputPath: string"})," - the absolute path of the output directory"]}),"\n"]}),"\n",(0,o.jsxs)(n.p,{children:["Return new content as a ",(0,o.jsx)(n.code,{children:"string"}),".\nIf return ",(0,o.jsx)(n.code,{children:"undefined"}),", the result processed via Webpack plugin is ignored and will be saved a result processed via the loader."]})]})}function d(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(a,{...e})}):a(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>c});var t=s(6540);const o={},i=t.createContext(o);function r(e){const n=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),t.createElement(i.Provider,{value:n},e.children)}}}]);