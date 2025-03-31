"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[272],{5862:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>c,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>o,toc:()=>d});const o=JSON.parse('{"id":"guides/import-css-from-node-modules-in-scss","title":"Import package style in SCSS","description":"The plugin resolves default style files defined in node_modules automatically.","source":"@site/docs/guides/import-css-from-node-modules-in-scss.md","sourceDirName":"guides","slug":"/guides/import-css-from-node-modules-in-scss","permalink":"/html-bundler-webpack-plugin/guides/import-css-from-node-modules-in-scss","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs-gh/tree/master/docs/guides/import-css-from-node-modules-in-scss.md","tags":[],"version":"current","sidebarPosition":6,"frontMatter":{"sidebar_position":6,"title":"Import package style in SCSS"},"sidebar":"guidesSidebar","previous":{"title":"Load JS and CSS from package in template","permalink":"/html-bundler-webpack-plugin/guides/load-js-css-from-node-modules"},"next":{"title":"Resolve in JSON value of attribute","permalink":"/html-bundler-webpack-plugin/guides/resolve-attr-json"}}');var t=n(4848),i=n(8453);const r={sidebar_position:6,title:"Import package style in SCSS"},l="Import CSS or SCSS from package in SCSS",c={},d=[];function a(e){const s={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,i.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(s.header,{children:(0,t.jsx)(s.h1,{id:"import-css-or-scss-from-package-in-scss",children:"Import CSS or SCSS from package in SCSS"})}),"\n",(0,t.jsxs)(s.p,{children:["The plugin resolves default style files defined in ",(0,t.jsx)(s.code,{children:"node_modules"})," automatically."]}),"\n",(0,t.jsx)(s.p,{children:"For example, import source styles of material-icons:"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-scss",children:"// import source styles from `material-icons` module\n@use 'material-icons';\n\n// define short class name for original `.material-icons-outlined` class name from module\n.mat-icon {\n  @extend .material-icons-outlined;\n}\n"})}),"\n",(0,t.jsx)(s.p,{children:"You can import a file from a module using the module name and the path to the file:"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-scss",children:"@use '<package>/path/to/style';\n"})}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsx)(s.admonition,{type:"warning",children:(0,t.jsxs)(s.ul,{children:["\n",(0,t.jsx)(s.li,{children:"The file extension, e.g. .scss, .css, must be omitted."}),"\n",(0,t.jsxs)(s.li,{children:["Use the ",(0,t.jsx)(s.code,{children:"@use"})," instead of ",(0,t.jsx)(s.code,{children:"@import"}),", because it is ",(0,t.jsx)(s.a,{href:"https://github.com/sass/sass/blob/main/accepted/module-system.md#timeline",children:"deprecated"}),"."]}),"\n"]})}),"\n"]}),"\n",(0,t.jsxs)(s.p,{children:["For example, import the style theme ",(0,t.jsx)(s.code,{children:"tomorrow"})," from the ",(0,t.jsx)(s.a,{href:"https://github.com/PrismJS/prism",children:"prismjs"})," module:"]}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-scss",children:"@use 'prismjs/themes/prism-tomorrow.min';\n"})}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.admonition,{type:"warning",children:[(0,t.jsxs)(s.p,{children:["Don't use ",(0,t.jsx)(s.a,{href:"https://github.com/bholloway/resolve-url-loader",children:"resolve-url-loader"}),"!"]}),(0,t.jsxs)(s.p,{children:["The plugin resolves styles faster than ",(0,t.jsx)(s.code,{children:"resolve-url-loader"})," and don't requires using the ",(0,t.jsx)(s.code,{children:"source map"})," in ",(0,t.jsx)(s.code,{children:"sass-loader"})," options."]})]}),"\n"]})]})}function m(e={}){const{wrapper:s}={...(0,i.R)(),...e.components};return s?(0,t.jsx)(s,{...e,children:(0,t.jsx)(a,{...e})}):a(e)}},8453:(e,s,n)=>{n.d(s,{R:()=>r,x:()=>l});var o=n(6540);const t={},i=o.createContext(t);function r(e){const s=o.useContext(i);return o.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function l(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),o.createElement(i.Provider,{value:s},e.children)}}}]);