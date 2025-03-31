"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[1638],{4145:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>t,contentTitle:()=>c,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>r});const l=JSON.parse('{"id":"Plugins/favicons","title":"FaviconsBundlerPlugin","description":"The FaviconsBundlerPlugin generates favicons for different devices and injects favicon tags into HTML head.","source":"@site/docs/Plugins/favicons.mdx","sourceDirName":"Plugins","slug":"/Plugins/favicons","permalink":"/html-bundler-webpack-plugin/Plugins/favicons","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/Plugins/favicons.mdx","tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_position":3},"sidebar":"docsSidebar","previous":{"title":"Third-party","permalink":"/html-bundler-webpack-plugin/Plugins/third-party"},"next":{"title":"Hooks & Callbacks","permalink":"/html-bundler-webpack-plugin/hooks-and-callbacks"}}');var o=i(4848),s=i(8453);const a={sidebar_position:3},c="FaviconsBundlerPlugin",t={},r=[{value:"Install",id:"install",level:2},{value:"Config",id:"config",level:2},{value:"Options",id:"options",level:2},{value:"Usage",id:"usage",level:2}];function d(e){const n={a:"a",br:"br",code:"code",em:"em",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,s.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.header,{children:(0,o.jsx)(n.h1,{id:"faviconsbundlerplugin",children:"FaviconsBundlerPlugin"})}),"\n",(0,o.jsxs)(n.p,{children:["The ",(0,o.jsx)(n.a,{href:"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/plugins/favicons-bundler-plugin",children:"FaviconsBundlerPlugin"})," generates favicons for different devices and injects favicon tags into HTML head."]}),"\n",(0,o.jsx)(n.h2,{id:"install",children:"Install"}),"\n",(0,o.jsxs)(n.p,{children:["This plugin requires the additional ",(0,o.jsx)(n.a,{href:"https://github.com/itgalaxy/favicons",children:"favicons"})," package."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{children:"npm install favicons -D\n"})}),"\n",(0,o.jsx)(n.h2,{id:"config",children:"Config"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\nconst { FaviconsBundlerPlugin } = require('html-bundler-webpack-plugin/plugins');\n\nmodule.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        // source favicon file must be specified directly in HTML using link tag\n        index: './src/views/index.html',\n      },\n    }),\n    // add the favicons plugin\n    new FaviconsBundlerPlugin({\n      enabled: 'auto', // true, false, auto - generate favicons in production mode only\n      // favicons configuration options, see https://github.com/itgalaxy/favicons#usage\n      faviconOptions: {\n        path: '/img/favicons', // favicons output path relative to webpack output.path\n        icons: {\n          android: true, // Create Android homescreen icon.\n          appleIcon: true, // Create Apple touch icons.\n          appleStartup: false, // Create Apple startup images.\n          favicons: true, // Create regular favicons.\n          windows: false, // Create Windows 8 tile icons.\n          yandex: false, // Create Yandex browser icon.\n        },\n      },\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.(png|jpe?g|ico|svg)$/,\n        type: 'asset/resource',\n      },\n    ],\n  },\n};\n"})}),"\n",(0,o.jsx)(n.h2,{id:"options",children:"Options"}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"enabled: boolean | 'auto'"}),(0,o.jsx)(n.br,{}),"\n","if is ",(0,o.jsx)(n.code,{children:"'auto'"})," then generate favicons in production mode only,\nin development mode will be used original favicon processed via webpack asset module."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"faviconOptions: FaviconOptions"})," - options of the ",(0,o.jsx)(n.a,{href:"https://github.com/itgalaxy/favicons",children:"favicons"})," module. See ",(0,o.jsx)(n.a,{href:"https://github.com/itgalaxy/favicons#usage",children:"configuration options"}),"."]}),"\n"]}),"\n",(0,o.jsx)(n.h2,{id:"usage",children:"Usage"}),"\n",(0,o.jsxs)(n.p,{children:["The source file of your favicon must be specified directly in HTML as the ",(0,o.jsx)(n.code,{children:"link"})," tag with ",(0,o.jsx)(n.code,{children:'rel="icon"'})," attribute."]}),"\n",(0,o.jsxs)(n.p,{children:["If the FaviconsBundlerPlugin is disabled or as ",(0,o.jsx)(n.code,{children:"auto"})," in development mode,\nthen the source favicon file will be processed via ",(0,o.jsx)(n.code,{children:"webpack"}),"."]}),"\n",(0,o.jsxs)(n.p,{children:["If the FaviconsBundlerPlugin is enabled or as ",(0,o.jsx)(n.code,{children:"auto"})," in production mode,\nthen the source favicon file will be processed via ",(0,o.jsx)(n.code,{children:"favicons"})," module and\nthe original ",(0,o.jsx)(n.code,{children:"link"})," tag with favicon will be replaced with generated favicon tags."]}),"\n",(0,o.jsxs)(n.p,{children:["For example, there is the ",(0,o.jsx)(n.em,{children:"src/views/index.html"})]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html>\n<head>\n  \x3c!-- source favicon file relative to this HTML file, or use a webpack alias --\x3e\n  <link href="./myFavicon.png" rel="icon" />\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>\n'})}),"\n",(0,o.jsxs)(n.p,{children:["The generated HTML when FaviconsBundlerPlugin is ",(0,o.jsx)(n.code,{children:"disabled"}),":"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html>\n<head>\n  \x3c!-- output favicon file --\x3e\n  <link href="assets/img/myFavicon.1234abcd.png" rel="icon" />\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>\n'})}),"\n",(0,o.jsxs)(n.p,{children:["The generated HTML when FaviconsBundlerPlugin is ",(0,o.jsx)(n.code,{children:"enabled"}),":"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html>\n<head>\n  \x3c!-- original tag is replaced with tags generated by favicons module --\x3e\n  <link rel="apple-touch-icon" sizes="1024x1024" href="/img/favicons/apple-touch-icon-1024x1024.png">\n  <link rel="apple-touch-icon" sizes="114x114" href="/img/favicons/apple-touch-icon-114x114.png">\n  <link rel="apple-touch-icon" sizes="120x120" href="/img/favicons/apple-touch-icon-120x120.png">\n  <link rel="apple-touch-icon" sizes="144x144" href="/img/favicons/apple-touch-icon-144x144.png">\n  <link rel="apple-touch-icon" sizes="152x152" href="/img/favicons/apple-touch-icon-152x152.png">\n  <link rel="apple-touch-icon" sizes="167x167" href="/img/favicons/apple-touch-icon-167x167.png">\n  <link rel="apple-touch-icon" sizes="180x180" href="/img/favicons/apple-touch-icon-180x180.png">\n  <link rel="apple-touch-icon" sizes="57x57" href="/img/favicons/apple-touch-icon-57x57.png">\n  <link rel="apple-touch-icon" sizes="60x60" href="/img/favicons/apple-touch-icon-60x60.png">\n  <link rel="apple-touch-icon" sizes="72x72" href="/img/favicons/apple-touch-icon-72x72.png">\n  <link rel="apple-touch-icon" sizes="76x76" href="/img/favicons/apple-touch-icon-76x76.png">\n  <link rel="icon" type="image/png" sizes="16x16" href="/img/favicons/favicon-16x16.png">\n  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicons/favicon-32x32.png">\n  <link rel="icon" type="image/png" sizes="48x48" href="/img/favicons/favicon-48x48.png">\n  <link rel="icon" type="image/x-icon" href="/img/favicons/favicon.ico">\n  <link rel="manifest" href="/img/favicons/manifest.webmanifest">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n  <meta name="apple-mobile-web-app-title" content="My App">\n  <meta name="application-name" content="My App">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="theme-color" content="#fff">\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>\n'})})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>a,x:()=>c});var l=i(6540);const o={},s=l.createContext(o);function a(e){const n=l.useContext(s);return l.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),l.createElement(s.Provider,{value:n},e.children)}}}]);