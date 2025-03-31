"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[921],{739:(e,i,n)=>{n.r(i),n.d(i,{assets:()=>c,contentTitle:()=>l,default:()=>u,frontMatter:()=>r,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"Options/PluginOptions/minify","title":"minify","description":"Option: minify","source":"@site/docs/Options/PluginOptions/minify.mdx","sourceDirName":"Options/PluginOptions","slug":"/plugin-options-minify","permalink":"/html-bundler-webpack-plugin/plugin-options-minify","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/Options/PluginOptions/minify.mdx","tags":[{"inline":true,"label":"HTML","permalink":"/html-bundler-webpack-plugin/tags/html"},{"inline":true,"label":"minify","permalink":"/html-bundler-webpack-plugin/tags/minify"}],"version":"current","sidebarPosition":190,"frontMatter":{"sidebar_position":190,"slug":"/plugin-options-minify","title":"minify","tags":["HTML","minify"]},"sidebar":"docsSidebar","previous":{"title":"integrity","permalink":"/html-bundler-webpack-plugin/plugin-options-integrity"},"next":{"title":"extractComments","permalink":"/html-bundler-webpack-plugin/plugin-options-extractComments"}}');var s=n(4848),o=n(8453);const r={sidebar_position:190,slug:"/plugin-options-minify",title:"minify",tags:["HTML","minify"]},l="Minify output HTML",c={},d=[{value:"<code>minifyOptions</code>",id:"minifyoptions",level:3}];function p(e){const i={a:"a",br:"br",code:"code",h1:"h1",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(i.header,{children:(0,s.jsx)(i.h1,{id:"minify-output-html",children:"Minify output HTML"})}),"\n",(0,s.jsxs)(i.p,{children:["Option: ",(0,s.jsx)(i.code,{children:"minify"})]}),"\n",(0,s.jsxs)(i.p,{children:["Type: ",(0,s.jsx)(i.code,{children:"'auto'|boolean|Object"})," Default: ",(0,s.jsx)(i.code,{children:"false"})]}),"\n",(0,s.jsxs)(i.p,{children:["For minification generated HTML is used the ",(0,s.jsx)(i.a,{href:"https://github.com/terser/html-minifier-terser",children:"html-minifier-terser"})," with the following ",(0,s.jsx)(i.code,{children:"default options"}),":"]}),"\n",(0,s.jsx)(i.pre,{children:(0,s.jsx)(i.code,{className:"language-js",children:'{\n  collapseWhitespace: true,\n  keepClosingSlash: true,\n  removeComments: true,\n  removeRedundantAttributes: false, // prevents styling bug when input "type=text" is removed\n  removeScriptTypeAttributes: true,\n  removeStyleLinkTypeAttributes: true,\n  useShortDoctype: true,\n  minifyCSS: true,\n  minifyJS: true,\n}\n'})}),"\n",(0,s.jsx)(i.p,{children:"Possible values:"}),"\n",(0,s.jsxs)(i.ul,{children:["\n",(0,s.jsxs)(i.li,{children:[(0,s.jsx)(i.code,{children:"false"})," - disable minification"]}),"\n",(0,s.jsxs)(i.li,{children:[(0,s.jsx)(i.code,{children:"true"})," - enable minification with default options"]}),"\n",(0,s.jsxs)(i.li,{children:[(0,s.jsx)(i.code,{children:"'auto'"})," - in ",(0,s.jsx)(i.code,{children:"development"})," mode disable minification, in ",(0,s.jsx)(i.code,{children:"production"})," mode enable minification with default options,\nuse ",(0,s.jsx)(i.a,{href:"/plugin-options-minify#minifyoptions",children:"minifyOptions"})," to customize options"]}),"\n",(0,s.jsxs)(i.li,{children:[(0,s.jsx)(i.code,{children:"{}"})," - enable minification with custom options, this object are merged with ",(0,s.jsx)(i.code,{children:"default options"}),(0,s.jsx)(i.br,{}),"\n","see ",(0,s.jsx)(i.a,{href:"https://github.com/terser/html-minifier-terser#options-quick-reference",children:"options reference"})]}),"\n"]}),"\n",(0,s.jsx)("a",{id:"option-minify-options",name:"option-minify-options"}),"\n",(0,s.jsx)(i.h3,{id:"minifyoptions",children:(0,s.jsx)(i.code,{children:"minifyOptions"})}),"\n",(0,s.jsxs)(i.p,{children:["Type: ",(0,s.jsx)(i.code,{children:"Object"})," Default: ",(0,s.jsx)(i.code,{children:"null"})]}),"\n",(0,s.jsxs)(i.p,{children:["When the ",(0,s.jsx)(i.code,{children:"minify"})," option is set to ",(0,s.jsx)(i.code,{children:"'auto'"})," or ",(0,s.jsx)(i.code,{children:"true"}),", you can configure ",(0,s.jsx)(i.a,{href:"https://github.com/terser/html-minifier-terser",children:"minification options"})," using the ",(0,s.jsx)(i.code,{children:"minifyOptions"}),"."]})]})}function u(e={}){const{wrapper:i}={...(0,o.R)(),...e.components};return i?(0,s.jsx)(i,{...e,children:(0,s.jsx)(p,{...e})}):p(e)}},8453:(e,i,n)=>{n.d(i,{R:()=>r,x:()=>l});var t=n(6540);const s={},o=t.createContext(s);function r(e){const i=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),t.createElement(o.Provider,{value:i},e.children)}}}]);