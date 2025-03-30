"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[2330],{1967:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>r,toc:()=>l});const r=JSON.parse('{"id":"guides/preprocessor/tempura","title":"Tempura","description":"Link: Tempura","source":"@site/docs/guides/preprocessor/tempura.mdx","sourceDirName":"guides/preprocessor","slug":"/guides/preprocessor/tempura","permalink":"/html-bundler-webpack-plugin/guides/preprocessor/tempura","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/docs/guides/preprocessor/tempura.mdx","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2},"sidebar":"guidesSidebar","previous":{"title":"Pug","permalink":"/html-bundler-webpack-plugin/guides/preprocessor/pugjs"},"next":{"title":"TwigJS","permalink":"/html-bundler-webpack-plugin/guides/preprocessor/twigjs"}}');var i=s(4848),t=s(8453);const o={sidebar_position:2},a="Tempura",c={},l=[{value:"<code>preprocessor: &#39;tempura&#39;</code>",id:"preprocessor-tempura",level:2},{value:"<code>preprocessorOptions</code>",id:"preprocessoroptions",level:2},{value:"Using build-in <code>include</code> helper",id:"using-build-in-include-helper",level:3}];function p(e){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,t.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"tempura",children:"Tempura"})}),"\n",(0,i.jsxs)(n.p,{children:["Link: ",(0,i.jsx)(n.a,{href:"https://github.com/lukeed/tempura",children:"Tempura"})]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"https://github.com/lukeed/tempura",children:"Tempura"})," is a light and fast template engine with Handlebars-like syntax."]}),"\n",(0,i.jsxs)(n.p,{children:["You need to install the ",(0,i.jsx)(n.code,{children:"tempura"})," package:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{children:"npm i -D tempura\n"})}),"\n",(0,i.jsx)(n.h2,{id:"preprocessor-tempura",children:(0,i.jsx)(n.code,{children:"preprocessor: 'tempura'"})}),"\n",(0,i.jsxs)(n.p,{children:["For example, there is the template ",(0,i.jsx)(n.em,{children:"src/views/page/home.hbs"})]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-hbs",children:"<!DOCTYPE html>\n<html>\n<head>\n  <title>{{ title }}</title>\n</head>\n<body>\n  {{#include src='header.hbs' }}\n  <div class=\"container\">\n    <h1>Tempura</h1>\n    <div>{{ persons.length }} persons:</div>\n    <ul class=\"person\">\n      {{#each persons as person}}\n        <li>{{person.name}} is {{person.age}} years old.</li>\n      {{/each}}\n    </ul>\n  </div>\n  {{#include src='footer.hbs' }}\n</body>\n</html>\n"})}),"\n",(0,i.jsxs)(n.p,{children:["Define the ",(0,i.jsx)(n.code,{children:"preprocessor"})," as ",(0,i.jsx)(n.code,{children:"tempura"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nmodule.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        // define templates here\n        index: {\n          import: 'src/views/pages/home.hbs', // => dist/index.html\n          // pass data to template as an object\n          data: {\n            title: 'Tempura',\n             persons: [\n                { name: 'Robert', age: 30 },\n                ...\n             ],\n          },\n        },\n      },\n      // use tempura templating engine\n      preprocessor: 'tempura',\n      // define options\n      preprocessorOptions: {\n        views: ['src/views/partials'],\n      },\n    }),\n  ],\n};\n"})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/examples/tempura/",children:"Source code of the example"})}),"\n",(0,i.jsx)(n.h2,{id:"preprocessoroptions",children:(0,i.jsx)(n.code,{children:"preprocessorOptions"})}),"\n",(0,i.jsxs)(n.p,{children:["The preprocessor has built-in ",(0,i.jsx)(n.code,{children:"include"})," helper, to load a partial file."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-js",children:"{\n  preprocessor: 'tempura',\n  preprocessorOptions: {\n    // defaults process.cwd(), root path for includes with an absolute path (e.g., /file.html)\n    root: path.join(__dirname, 'src/views/'), // defaults process.cwd()\n    // defaults [], an array of paths to use when resolving includes with relative paths\n    views: [\n      'src/views/includes', // relative path\n      path.join(__dirname, 'src/views/partials'), // absolute path\n    ],\n    blocks: {\n      // define here custom helpers\n      bar: ({ value }) => `<bar>${value}</bar>`,\n    },\n  },\n},\n"})}),"\n",(0,i.jsxs)(n.p,{children:["For all available options, see the ",(0,i.jsx)(n.a,{href:"https://github.com/lukeed/tempura/blob/master/docs/api.md#options-2",children:"Tempura API options"}),"."]}),"\n",(0,i.jsxs)(n.h3,{id:"using-build-in-include-helper",children:["Using build-in ",(0,i.jsx)(n.code,{children:"include"})," helper"]}),"\n",(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"src"})," attribute contains a path to the partial file."]}),"\n",(0,i.jsx)(n.p,{children:"The path relative to current working directory (defaults webpack config directory):"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-hbs",children:"{{#include src='src/views/partials/header.hbs' }}\n"})}),"\n",(0,i.jsxs)(n.p,{children:["The path relative to directory defined in ",(0,i.jsx)(n.code,{children:"root"})," option, e.g. ",(0,i.jsx)(n.code,{children:"root: 'src/view'"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-hbs",children:"{{#include src='partials/header.hbs' }}\n"})}),"\n",(0,i.jsxs)(n.p,{children:["The path relative to one of directories defined in ",(0,i.jsx)(n.code,{children:"views"})," option, e.g. ",(0,i.jsx)(n.code,{children:"views: ['src/views/partials']"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-hbs",children:"{{#include src='header.hbs' }}\n"})})]})}function d(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(p,{...e})}):p(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>a});var r=s(6540);const i={},t=r.createContext(i);function o(e){const n=r.useContext(t);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);