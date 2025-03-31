"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[1258],{5115:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>o,contentTitle:()=>c,default:()=>u,frontMatter:()=>r,metadata:()=>t,toc:()=>a});const t=JSON.parse('{"id":"guides/dynamic-load-css","title":"Lazy loading CSS","description":"For dynamic file loading, we need the output filename of extracted CSS from a source style file.","source":"@site/docs/guides/dynamic-load-css.md","sourceDirName":"guides","slug":"/guides/dynamic-load-css","permalink":"/html-bundler-webpack-plugin/guides/dynamic-load-css","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs-gh/tree/master/docs/guides/dynamic-load-css.md","tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_position":5,"title":"Lazy loading CSS"},"sidebar":"guidesSidebar","previous":{"title":"Inline images in HTML","permalink":"/html-bundler-webpack-plugin/guides/inline-images"},"next":{"title":"Import CSS classes in JS","permalink":"/html-bundler-webpack-plugin/guides/import-css-class-names"}}');var l=n(4848),i=n(8453);const r={sidebar_position:5,title:"Lazy loading CSS"},c="Load CSS file dynamically",o={},a=[];function d(e){const s={a:"a",code:"code",h1:"h1",header:"header",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(s.header,{children:(0,l.jsx)(s.h1,{id:"load-css-file-dynamically",children:"Load CSS file dynamically"})}),"\n",(0,l.jsxs)(s.p,{children:["For dynamic file loading, we need the output filename of extracted CSS from a source style file.\nTo get the CSS output filename in JavaScript, you can use the ",(0,l.jsx)(s.code,{children:"url"})," query:"]}),"\n",(0,l.jsx)(s.pre,{children:(0,l.jsx)(s.code,{className:"language-js",children:"import cssUrl from './style.scss?url';\n// - OR -\nconst cssUrl = require('./style.scss?url');\n"})}),"\n",(0,l.jsxs)(s.p,{children:["Where the ",(0,l.jsx)(s.code,{children:"./style.scss"})," is the source SCSS file relative to the JavaScript file."]}),"\n",(0,l.jsx)(s.p,{children:"To load a CSS file dynamically, you can use following function:"}),"\n",(0,l.jsx)(s.pre,{children:(0,l.jsx)(s.code,{className:"language-js",children:"import cssUrl from './style.scss?url';\n\nfunction loadCSS(url) {\n  const style = document.createElement('link');\n  style.href = url;\n  style.rel = 'stylesheet';\n  document.head.appendChild(style);\n}\n\nloadCSS(cssUrl);\n"})}),"\n",(0,l.jsxs)(s.p,{children:["The CSS will be extracted into separate file and the ",(0,l.jsx)(s.code,{children:"cssUrl"})," variable will contains the CSS output filename."]}),"\n",(0,l.jsxs)(s.p,{children:["Since 2023, many browsers support the modern way to add the stylesheets into DOM without creating the ",(0,l.jsx)(s.code,{children:"link"})," tag."]}),"\n",(0,l.jsx)(s.pre,{children:(0,l.jsx)(s.code,{className:"language-js",children:"import cssUrl from './style.scss?url';\n\nasync function loadCSS(url) {\n  const response = await fetch(url);\n  const css = await response.text();\n  const sheet = new CSSStyleSheet();\n  sheet.replaceSync(css);\n  document.adoptedStyleSheets = [sheet];\n}\n\nloadCSS(cssUrl);\n"})}),"\n",(0,l.jsxs)(s.p,{children:["See the ",(0,l.jsx)(s.a,{href:"https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets#browser_compatibility",children:"browser compatibility"}),"."]})]})}function u(e={}){const{wrapper:s}={...(0,i.R)(),...e.components};return s?(0,l.jsx)(s,{...e,children:(0,l.jsx)(d,{...e})}):d(e)}},8453:(e,s,n)=>{n.d(s,{R:()=>r,x:()=>c});var t=n(6540);const l={},i=t.createContext(l);function r(e){const s=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:r(e.components),t.createElement(i.Provider,{value:s},e.children)}}}]);