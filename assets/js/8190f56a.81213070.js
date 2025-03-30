"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9985],{1736:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>l,default:()=>p,frontMatter:()=>o,metadata:()=>s,toc:()=>c});const s=JSON.parse('{"id":"guides/preprocessor/eta","title":"Eta","description":"Link: Eta","source":"@site/docs/guides/preprocessor/eta.mdx","sourceDirName":"guides/preprocessor","slug":"/guides/preprocessor/eta","permalink":"/html-bundler-webpack-plugin/guides/preprocessor/eta","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/docs/guides/preprocessor/eta.mdx","tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1},"sidebar":"guidesSidebar","previous":{"title":"Template Engines","permalink":"/html-bundler-webpack-plugin/category/template-engines"},"next":{"title":"EJS","permalink":"/html-bundler-webpack-plugin/guides/preprocessor/ejs"}}');var r=t(4848),i=t(8453);const o={sidebar_position:1},l="Eta",a={},c=[{value:"<code>preprocessor: &#39;eta&#39;</code> (default)",id:"preprocessor-eta-default",level:2},{value:"<code>preprocessorOptions</code>",id:"preprocessoroptions",level:2}];function d(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"eta",children:"Eta"})}),"\n",(0,r.jsxs)(n.p,{children:["Link: ",(0,r.jsx)(n.a,{href:"https://eta.js.org",children:"Eta"})]}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.em,{children:'Supported "out of the box"'})}),"\n",(0,r.jsxs)(n.h2,{id:"preprocessor-eta-default",children:[(0,r.jsx)(n.code,{children:"preprocessor: 'eta'"})," (default)"]}),"\n",(0,r.jsxs)(n.p,{children:["The default preprocessor ",(0,r.jsx)(n.code,{children:"eta"})," can be omitted:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"new HtmlBundlerPlugin({\n  entry: {\n    index: './src/views/page/index.eta',\n  },\n  // preprocessor: 'eta', // Default template engine\n  // preprocessorOptions: {...},\n});\n"})}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Eta"})," is ",(0,r.jsx)(n.a,{href:"#eta-compatibility-with-ejs",children:"compatible*"})," with ",(0,r.jsx)(n.code,{children:"EJS"})," syntax, is smaller and faster than ",(0,r.jsx)(n.code,{children:"EJS"}),"."]}),"\n",(0,r.jsxs)(n.p,{children:["For example, there is the template ",(0,r.jsx)(n.em,{children:"src/views/page/index.eta"})]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-html",children:"<html>\n  <body>\n    <h1><%= headline %></h1>\n    <ul class=\"people\">\n      <% for (let i = 0; i < people.length; i++) {%>\n      <li><%= people[i] %></li>\n      <% } %>\n    </ul>\n    <%~ include('/src/views/partials/footer') %>\n  </body>\n</html>\n"})}),"\n",(0,r.jsx)(n.p,{children:"The minimal Webpack config:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nmodule.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: {\n          import: './src/views/page/index.eta', // Output dist/index.html\n          data: {\n            headline: 'Breaking Bad',\n            people: ['Walter White', 'Jesse Pinkman'],\n          },\n        },\n      },\n    }),\n  ],\n};\n"})}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsx)(n.admonition,{type:"warning",children:(0,r.jsxs)(n.p,{children:["For compatibility the Eta compiler with the EJS templates, the default preprocessor use the ",(0,r.jsx)(n.code,{children:"useWith: true"})," Eta option\nto use variables in template without the Eta-specific ",(0,r.jsx)(n.code,{children:"it."})," scope."]})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"preprocessoroptions",children:(0,r.jsx)(n.code,{children:"preprocessorOptions"})}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"{\n  async: false, // defaults 'false', when is 'true' then must be used `await includeAsync()`\n  useWith: true, // defaults 'true', use variables in template without `it.` scope\n  views: 'src/views', // relative path to directory that contains templates\n  // views: path.join(__dirname, 'src/views'), // absolute path to directory that contains templates\n},\n"})}),"\n",(0,r.jsxs)(n.p,{children:["For the complete list of options see ",(0,r.jsx)(n.a,{href:"https://eta.js.org/docs/api/configuration",children:"here"}),"."]}),"\n",(0,r.jsx)(n.p,{children:"For example, there are a template page and partials:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"src/views/\n\u2502\u2500\u2500 page/\n\u2502   \u2514\u2500\u2500 home.html\n\u2502\u2500\u2500 includes/\n\u2502   \u251c\u2500\u2500 gallery.html\n\u2502   \u2514\u2500\u2500 teaser.html\n\u2502\u2500\u2500 partials/\n\u2502   \u251c\u2500\u2500 footer.html\n\u2502   \u2514\u2500\u2500 menu/\n\u2502       \u251c\u2500\u2500 nav.html\n\u2502       \u2514\u2500\u2500 top/\n\u2502           \u2514\u2500\u2500 desktop.html\n\n"})}),"\n",(0,r.jsxs)(n.p,{children:["Include the partials in the ",(0,r.jsx)(n.code,{children:"src/views/page/home.html"})," template with the ",(0,r.jsx)(n.code,{children:"include()"}),":"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-html",children:"<%~ include('teaser.html') %>\n<%~ include('menu/nav.html') %>\n<%~ include('menu/top/desktop.html') %>\n<%~ include('footer.html') %>\n"})}),"\n",(0,r.jsxs)(n.p,{children:["If partials have ",(0,r.jsx)(n.code,{children:".eta"})," extensions, then the extension can be omitted in the include argument."]})]})}function p(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>l});var s=t(6540);const r={},i=s.createContext(r);function o(e){const n=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),s.createElement(i.Provider,{value:n},e.children)}}}]);