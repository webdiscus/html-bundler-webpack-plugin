"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[6455],{1243:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>r,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>o});const s=JSON.parse('{"id":"guides/external-data-in-template","title":"Provide external data in template","description":"You can pass variables into template using a template engine, e.g. Handlebars.","source":"@site/docs/guides/external-data-in-template.mdx","sourceDirName":"guides","slug":"/guides/external-data-in-template","permalink":"/html-bundler-webpack-plugin/guides/external-data-in-template","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs-gh/tree/master/docs/guides/external-data-in-template.mdx","tags":[],"version":"current","sidebarPosition":8,"frontMatter":{"sidebar_position":8},"sidebar":"guidesSidebar","previous":{"title":"Resolve image in href","permalink":"/html-bundler-webpack-plugin/guides/resolve-image-in-href"},"next":{"title":"Template Engines","permalink":"/html-bundler-webpack-plugin/category/template-engines"}}');var a=t(4848),l=t(8453);const i={sidebar_position:8},r="Provide external data in template",c={},o=[];function d(e){const n={a:"a",br:"br",code:"code",em:"em",h1:"h1",header:"header",p:"p",pre:"pre",...(0,l.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"provide-external-data-in-template",children:"Provide external data in template"})}),"\n",(0,a.jsxs)(n.p,{children:["You can pass variables into template using a template engine, e.g. ",(0,a.jsx)(n.a,{href:"https://handlebarsjs.com",children:"Handlebars"}),".\nFor multiple page configuration, better to use the ",(0,a.jsx)(n.a,{href:"https://mozilla.github.io/nunjucks",children:"Nunjucks"})," template engine maintained by Mozilla."]}),"\n",(0,a.jsxs)(n.p,{children:["For example, you have several pages with variables.",(0,a.jsx)(n.br,{}),"\n","Both pages have the same layout ",(0,a.jsx)(n.em,{children:"src/views/layouts/default.html"})]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-html",children:'<!doctype html>\n<html>\n  <head>\n    <title>{{ title }}</title>\n    \x3c!-- block for specific page styles --\x3e\n    {% block styles %}{% endblock %}\n    \x3c!-- block for specific page scripts --\x3e\n    {% block scripts %}{% endblock %}\n  </head>\n  <body>\n    <main class="main-content">\n      \x3c!-- block for specific page content --\x3e\n      {% block content %}{% endblock %}\n    </main>\n  </body>\n</html>\n'})}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.em,{children:"src/views/pages/home/index.html"})}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-html",children:'{% extends "src/views/layouts/default.html" %} {% block styles %}\n\x3c!-- include source style --\x3e\n<link href="./home.scss" rel="stylesheet" />\n{% endblock %} {% block scripts %}\n\x3c!-- include source script --\x3e\n<script src="./home.js" defer="defer"><\/script>\n{% endblock %} {% block content %}\n<h1>{{ filmTitle }}</h1>\n<p>Location: {{ location }}</p>\n\x3c!-- @images is the Webpack alias for the source images directory --\x3e\n<img src="@images/{{ imageFile }}" />\n{% endblock %}\n'})}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.em,{children:"src/views/pages/about/index.html"})}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-html",children:'{% extends "src/views/layouts/default.html" %} {% block styles %}\n<link href="./about.scss" rel="stylesheet" />\n{% endblock %} {% block scripts %}\n<script src="./about.js" defer="defer"><\/script>\n{% endblock %} {% block content %}\n<h1>Main characters</h1>\n<ul>\n  {% for item in actors %}\n  <li class="name">{{ item.firstname }} {{ item.lastname }}</li>\n  {% endfor %}\n</ul>\n{% endblock %}\n'})}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.em,{children:"Webpack config"})}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\n// External data\nconst entryData = {\n  // variables for home page\n  home: {\n    title: 'Home',\n    filmTitle: 'Breaking Bad',\n    location: 'Albuquerque, New Mexico',\n    imageFile: 'picture.png',\n  },\n  // variables for about page\n  about: {\n    title: 'About',\n    actors: [\n      {\n        firstname: 'Walter',\n        lastname: 'White, \"Heisenberg\"',\n      },\n      {\n        firstname: 'Jesse',\n        lastname: 'Pinkman',\n      },\n    ],\n  },\n};\n\nmodule.exports = {\n  resolve: {\n    alias: {\n      '@images': path.join(__dirname, 'src/assets/images'),\n    },\n  },\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: {\n          import: 'src/views/pages/home/index.html', // => dist/index.html\n          data: entryData.home,\n        },\n        about: {\n          import: 'src/views/pages/about/index.html', // => dist/about.html\n          data: entryData.about,\n        },\n      },\n      js: {\n        filename: 'js/[name].[contenthash:8].js',\n      },\n      css: {\n        filename: 'css/[name].[contenthash:8].css',\n      },\n      // use Nunjucks template engine\n      preprocessor: 'nunjucks',\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.(s?css|sass|s?css)$/,\n        use: ['css-loader', 'sass-loader'],\n      },\n      {\n        test: /\\.(png|svg|jpe?g|webp)$/i,\n        type: 'asset/resource',\n        generator: {\n          filename: 'assets/img/[name].[hash:8][ext]',\n        },\n      },\n    ],\n  },\n};\n"})}),"\n",(0,a.jsxs)(n.p,{children:["The generated ",(0,a.jsx)(n.em,{children:"dist/index.html"})]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-html",children:'<!doctype html>\n<html>\n  <head>\n    <title>Home</title>\n    <link href="css/home.2180238c.css" rel="stylesheet" />\n    <script src="js/home.790d746b.js" defer="defer"><\/script>\n  </head>\n  <body>\n    <main class="main-content">\n      <h1>Breaking Bad</h1>\n      <p>Breaking Bad is an American crime drama</p>\n      <p>Location: Albuquerque, New Mexico</p>\n      <img src="assets/img/picture.697ef306.png" alt="location" />\n    </main>\n  </body>\n</html>\n'})}),"\n",(0,a.jsxs)(n.p,{children:["The generated ",(0,a.jsx)(n.em,{children:"dist/about.html"})]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-html",children:'<!doctype html>\n<html>\n  <head>\n    <title>About</title>\n    <link href="css/about.2777c101.css" rel="stylesheet" />\n    <script src="js/about.1.c5e03c0e.js" defer="defer"><\/script>\n  </head>\n  <body>\n    <main class="main-content">\n      <h1>Main characters</h1>\n      <ul>\n        <li class="name">Walter White, &quot;Heisenberg&quot;</li>\n        <li class="name">Jesse Pinkman</li>\n      </ul>\n    </main>\n  </body>\n</html>\n'})})]})}function m(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>i,x:()=>r});var s=t(6540);const a={},l=s.createContext(a);function i(e){const n=s.useContext(l);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),s.createElement(l.Provider,{value:n},e.children)}}}]);