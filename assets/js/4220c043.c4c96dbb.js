"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[8353],{5537:(e,n,s)=>{s.d(n,{A:()=>k});var t=s(6540),r=s(4164),a=s(5627),l=s(6347),i=s(372),c=s(604),o=s(1861),u=s(8749);function d(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:s}=e;return(0,t.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:s,attributes:t,default:r}}=e;return{value:n,label:s,attributes:t,default:r}}))}(s);return function(e){const n=(0,o.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,s])}function p(e){let{value:n,tabValues:s}=e;return s.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:s}=e;const r=(0,l.W6)(),a=function(e){let{queryString:n=!1,groupId:s}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!s)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return s??null}({queryString:n,groupId:s});return[(0,c.aZ)(a),(0,t.useCallback)((e=>{if(!a)return;const n=new URLSearchParams(r.location.search);n.set(a,e),r.replace({...r.location,search:n.toString()})}),[a,r])]}function b(e){const{defaultValue:n,queryString:s=!1,groupId:r}=e,a=h(e),[l,c]=(0,t.useState)((()=>function(e){let{defaultValue:n,tabValues:s}=e;if(0===s.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!p({value:n,tabValues:s}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${s.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const t=s.find((e=>e.default))??s[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:n,tabValues:a}))),[o,d]=m({queryString:s,groupId:r}),[b,g]=function(e){let{groupId:n}=e;const s=function(e){return e?`docusaurus.tab.${e}`:null}(n),[r,a]=(0,u.Dv)(s);return[r,(0,t.useCallback)((e=>{s&&a.set(e)}),[s,a])]}({groupId:r}),f=(()=>{const e=o??b;return p({value:e,tabValues:a})?e:null})();(0,i.A)((()=>{f&&c(f)}),[f]);return{selectedValue:l,selectValue:(0,t.useCallback)((e=>{if(!p({value:e,tabValues:a}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),g(e)}),[d,g,a]),tabValues:a}}var g=s(9136);const f={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var x=s(4848);function j(e){let{className:n,block:s,selectedValue:t,selectValue:l,tabValues:i}=e;const c=[],{blockElementScrollPositionUntilNextRender:o}=(0,a.a_)(),u=e=>{const n=e.currentTarget,s=c.indexOf(n),r=i[s].value;r!==t&&(o(n),l(r))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const s=c.indexOf(e.currentTarget)+1;n=c[s]??c[0];break}case"ArrowLeft":{const s=c.indexOf(e.currentTarget)-1;n=c[s]??c[c.length-1];break}}n?.focus()};return(0,x.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.A)("tabs",{"tabs--block":s},n),children:i.map((e=>{let{value:n,label:s,attributes:a}=e;return(0,x.jsx)("li",{role:"tab",tabIndex:t===n?0:-1,"aria-selected":t===n,ref:e=>{c.push(e)},onKeyDown:d,onClick:u,...a,className:(0,r.A)("tabs__item",f.tabItem,a?.className,{"tabs__item--active":t===n}),children:s??n},n)}))})}function v(e){let{lazy:n,children:s,selectedValue:a}=e;const l=(Array.isArray(s)?s:[s]).filter(Boolean);if(n){const e=l.find((e=>e.props.value===a));return e?(0,t.cloneElement)(e,{className:(0,r.A)("margin-top--md",e.props.className)}):null}return(0,x.jsx)("div",{className:"margin-top--md",children:l.map(((e,n)=>(0,t.cloneElement)(e,{key:n,hidden:e.props.value!==a})))})}function y(e){const n=b(e);return(0,x.jsxs)("div",{className:(0,r.A)("tabs-container",f.tabList),children:[(0,x.jsx)(j,{...n,...e}),(0,x.jsx)(v,{...n,...e})]})}function k(e){const n=(0,g.A)();return(0,x.jsx)(y,{...e,children:d(e.children)},String(n))}},8453:(e,n,s)=>{s.d(n,{R:()=>l,x:()=>i});var t=s(6540);const r={},a=t.createContext(r);function l(e){const n=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),t.createElement(a.Provider,{value:n},e.children)}},9329:(e,n,s)=>{s.d(n,{A:()=>l});s(6540);var t=s(4164);const r={tabItem:"tabItem_Ymn6"};var a=s(4848);function l(e){let{children:n,hidden:s,className:l}=e;return(0,a.jsx)("div",{role:"tabpanel",className:(0,t.A)(r.tabItem,l),hidden:s,children:n})}},9851:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>u,contentTitle:()=>o,default:()=>p,frontMatter:()=>c,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"getting-started/basic-setup","title":"Basic Setup","description":"Install additional packages for CSS/SCSS:","source":"@site/docs/getting-started/basic-setup.mdx","sourceDirName":"getting-started","slug":"/getting-started/basic-setup","permalink":"/html-bundler-webpack-plugin/getting-started/basic-setup","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/docs/getting-started/basic-setup.mdx","tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_position":3},"sidebar":"docsSidebar","previous":{"title":"Minimal Setup","permalink":"/html-bundler-webpack-plugin/getting-started/minimal-setup"},"next":{"title":"Playground","permalink":"/html-bundler-webpack-plugin/getting-started/playground"}}');var r=s(4848),a=s(8453),l=s(5537),i=s(9329);const c={sidebar_position:3},o="Basic Setup",u={},d=[];function h(e){const n={admonition:"admonition",blockquote:"blockquote",code:"code",em:"em",h1:"h1",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"basic-setup",children:"Basic Setup"})}),"\n",(0,r.jsx)(n.p,{children:"Install additional packages for CSS/SCSS:"}),"\n",(0,r.jsxs)(l.A,{groupId:"packages",children:[(0,r.jsx)(i.A,{value:"npm",label:"npm",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"npm install --save-dev css-loader sass sass-loader\n"})})}),(0,r.jsx)(i.A,{value:"yarn",label:"yarn",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"yarn add --dev css-loader sass sass-loader\n"})})}),(0,r.jsx)(i.A,{value:"pnpm",label:"pnpm",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"pnpm add --save-dev css-loader sass sass-loader\n"})})})]}),"\n",(0,r.jsx)(n.p,{children:"There is an example of the project structure for a multiple pages:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"my-project/\n\u251c\u2500\u2500 dist/  (generated output)\n\u251c\u2500\u2500 src/\n\u2502   \u251c\u2500\u2500 images/\n\u2502   \u2502   \u251c\u2500\u2500 favicon.\n\u2502   \u2502   \u251c\u2500\u2500 banner.jpg\n\u2502   \u251c\u2500\u2500 styles/\n\u2502   \u2502   \u251c\u2500\u2500 vendor.scss\n\u2502   \u251c\u2500\u2500 scripts/\n\u2502   \u2502   \u251c\u2500\u2500 vendor.js\n\u2502   \u251c\u2500\u2500 pages/\n\u2502   \u2502   \u251c\u2500\u2500 home/\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 index.html\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 style.scss\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 script.js\n\u2502   \u2502   \u251c\u2500\u2500 about/\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 index.html\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 style.scss\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 script.js\n\u251c\u2500\u2500 webpack.config.js\n\u2514\u2500\u2500 package.json\n\n"})}),"\n",(0,r.jsxs)(n.p,{children:["The recommended base Webpack configuration, ",(0,r.jsx)(n.em,{children:"webpack.config.js"}),":"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"const path = require('path');\nconst HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nmodule.exports = {\n  resolve: {\n    alias: {\n      '@images': path.join(__dirname, 'src/images'),\n      '@scripts': path.join(__dirname, 'src/scripts'),\n      '@styles': path.join(__dirname, 'src/styles'),\n    },\n  },\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        // Define entry points for pages\n        index: './src/pages/home/index.html', // --\x3e dist/index.html\n        'about-us': './src/pages/about/index.html', // --\x3e dist/about-us.html\n      },\n      js: {\n        filename: 'js/[name].[contenthash:8].js', // Output JS filename\n      },\n      css: {\n        filename: 'css/[name].[contenthash:8].css', // Output CSS filename\n      },\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.s?css$/,\n        use: ['css-loader', 'sass-loader'],\n      },\n      {\n        test: /\\.(png|jpe?g|svg)$/,\n        type: 'asset/resource',\n        generator: {\n          filename: 'img/[name].[hash:8][ext]', // Output images filename\n        },\n      },\n    ],\n  },\n};\n"})}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsx)(n.admonition,{type:"info",children:(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["The default output directory is ",(0,r.jsx)(n.code,{children:"dist/"}),"."]}),"\n",(0,r.jsx)(n.li,{children:"All output filenames are relative to the output directory."}),"\n",(0,r.jsxs)(n.li,{children:["The ",(0,r.jsx)(n.code,{children:"entry"})," key determines the output HTML filename (excluding ",(0,r.jsx)(n.code,{children:".html"}),")."]}),"\n",(0,r.jsxs)(n.li,{children:["The ",(0,r.jsx)(n.code,{children:"js.filename"})," is the output JS filename."]}),"\n",(0,r.jsxs)(n.li,{children:["The ",(0,r.jsx)(n.code,{children:"css.filename"})," is the output CSS filename."]}),"\n",(0,r.jsxs)(n.li,{children:["The ",(0,r.jsx)(n.code,{children:"generator.filename"})," is the output filename for matched images."]}),"\n"]})}),"\n"]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.admonition,{type:"tip",children:[(0,r.jsxs)(n.p,{children:["In sources use Webpack aliases defined in ",(0,r.jsx)(n.code,{children:"resolve.alias"})," to avoid relative paths like:"]}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"../../images/"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"../../styles/"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"../../scripts/"})}),"\n",(0,r.jsx)(n.li,{children:"etc."}),"\n"]})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The template contains Webpack aliases to source resources:"}),"\n",(0,r.jsxs)(l.A,{groupId:"resources",children:[(0,r.jsx)(i.A,{value:"src HTML",label:"src/pages/home/index.html",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Home</title>\n  <link href="@images/favicon.svg" rel="icon" type="image/svg+xml">\n  <link href="./style.scss" rel="stylesheet"> \x3c!-- local template directory --\x3e\n  <link href="@styles/vendor.scss" rel="stylesheet">\n  <script src="@scripts/vendor.js" defer="defer"><\/script>\n</head>\n<body>\n  <h1>Home</h1>\n  <img src="@images/banner.png" alt="banner" />\n  <script src="./script.js"><\/script> \x3c!-- local template directory --\x3e\n</body>\n</html>\n'})})}),(0,r.jsx)(i.A,{value:"dist HTML",label:"dist/index.html (generated)",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Home</title>\n  <link href="img/favicon.f2794493.svg" rel="icon" type="image/svg+xml">\n  <link href="css/style.1b2f962c.css" rel="stylesheet">\n  <link href="css/vendor.487ba887.css" rel="stylesheet">\n  <script src="js/vendor.63bd5560.js" defer="defer"><\/script>\n</head>\n<body>\n  <h1>Home</h1>\n  <img src="img/banner.7b396424.png" alt="banner" />\n  <script src="js/script.0132c52e.js"><\/script>\n</body>\n</html>\n'})})})]}),"\n",(0,r.jsx)(n.p,{children:"The generated output:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"my-project/\n\u251c\u2500\u2500 dist/\n\u2502   \u251c\u2500\u2500 img/\n\u2502   \u2502   \u251c\u2500\u2500 favicon.f2794493.svg\n\u2502   \u2502   \u251c\u2500\u2500 banner.7b396424.png\n\u2502   \u251c\u2500\u2500 js/\n\u2502   \u2502   \u251c\u2500\u2500 script.0132c52e.js\n\u2502   \u2502   \u251c\u2500\u2500 vendor.63bd5560.js\n\u2502   \u251c\u2500\u2500 css/\n\u2502   \u2502   \u251c\u2500\u2500 style.1b2f962c.css\n\u2502   \u2502   \u251c\u2500\u2500 vendor.487ba887.css\n|   \u251c\u2500\u2500 index.html\n|   \u251c\u2500\u2500 about-us.html\n\u251c\u2500\u2500 src/\n"})})]})}function p(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}}}]);