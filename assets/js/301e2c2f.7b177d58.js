"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[2121],{2406:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>u,contentTitle:()=>c,default:()=>p,frontMatter:()=>o,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"getting-started/minimal-setup","title":"Minimal Setup","description":"Install additional packages for CSS/SCSS:","source":"@site/docs/getting-started/minimal-setup.mdx","sourceDirName":"getting-started","slug":"/getting-started/minimal-setup","permalink":"/html-bundler-webpack-plugin/getting-started/minimal-setup","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs-gh/tree/master/docs/getting-started/minimal-setup.mdx","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2},"sidebar":"docsSidebar","previous":{"title":"Installation","permalink":"/html-bundler-webpack-plugin/getting-started/installation"},"next":{"title":"Basic Setup","permalink":"/html-bundler-webpack-plugin/getting-started/basic-setup"}}');var s=t(4848),a=t(8453),l=t(5537),i=t(9329);const o={sidebar_position:2},c="Minimal Setup",u={},d=[];function h(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",em:"em",h1:"h1",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"minimal-setup",children:"Minimal Setup"})}),"\n",(0,s.jsx)(n.p,{children:"Install additional packages for CSS/SCSS:"}),"\n",(0,s.jsxs)(l.A,{groupId:"packages",children:[(0,s.jsx)(i.A,{value:"npm",label:"npm",children:(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"npm install --save-dev css-loader sass sass-loader\n"})})}),(0,s.jsx)(i.A,{value:"yarn",label:"yarn",children:(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"yarn add --dev css-loader sass sass-loader\n"})})}),(0,s.jsx)(i.A,{value:"pnpm",label:"pnpm",children:(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"pnpm add --save-dev css-loader sass sass-loader\n"})})})]}),"\n",(0,s.jsx)(n.p,{children:"There is an example of the simple project structure:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"my-project/\n\u251c\u2500\u2500 dist/  (generated output)\n\u251c\u2500\u2500 src/\n\u2502   \u251c\u2500\u2500 images/\n\u2502   \u2502   \u251c\u2500\u2500 favicon.svg\n\u2502   \u2502   \u251c\u2500\u2500 banner.png\n\u2502   \u251c\u2500\u2500 styles/\n\u2502   \u2502   \u251c\u2500\u2500 vendor.scss\n\u2502   \u251c\u2500\u2500 scripts/\n\u2502   \u2502   \u251c\u2500\u2500 vendor.js\n\u2502   \u251c\u2500\u2500 views/\n\u2502   \u2502   \u251c\u2500\u2500 index.html\n\u251c\u2500\u2500 webpack.config.js\n\u2514\u2500\u2500 package.json\n"})}),"\n",(0,s.jsxs)(n.p,{children:["The minimal Webpack configuration, ",(0,s.jsx)(n.em,{children:"webpack.config.js"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nmodule.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: './src/views/index.html', // path to template file\n      },\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.s?css$/,\n        use: ['css-loader', 'sass-loader'],\n      },\n      {\n        test: /\\.(png|jpe?g|webp|svg)$/,\n        type: 'asset/resource',\n      },\n    ],\n  },\n};\n"})}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"entry"})," key determines the output HTML filename (excluding ",(0,s.jsx)(n.code,{children:".html"}),")."]})}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["If your project has multiple pages, you can specify the ",(0,s.jsx)(n.code,{children:"entry"})," option as a path to the pages directory.\nGenerated HTML files keep the same directory structure relative to the entry path."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nmodule.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: './src/views', // path to pages directory\n    }),\n  ],\n  // ...\n};\n"})}),"\n",(0,s.jsx)(n.p,{children:"The template contains relative paths to source resources:"}),"\n",(0,s.jsxs)(l.A,{groupId:"resources",children:[(0,s.jsx)(i.A,{value:"src HTML",label:"src/views/index.html",children:(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Home</title>\n  <link href="../images/favicon.svg" rel="icon" type="image/svg+xml">\n  <link href="../styles/vendor.scss" rel="stylesheet">\n  <script src="../scripts/vendor.js" defer="defer"><\/script>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <img src="../images/banner.png" alt="banner" />\n</body>\n</html>\n'})})}),(0,s.jsx)(i.A,{value:"dist HTML",label:"dist/index.html (generated)",children:(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Home</title>\n  <link href="f279449352a40ca7f10b.svg" rel="icon" type="image/svg+xml">\n  <link href="vendor.css" rel="stylesheet">\n  <script src="vendor.js" defer="defer"><\/script>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <img src="d4711676b8bd60d6368c.png" alt="banner" />\n</body>\n</html>\n'})})})]}),"\n",(0,s.jsx)(n.p,{children:"Generate output:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"npx webpack build --mode production\n"})}),"\n",(0,s.jsxs)(n.p,{children:["New to Webpack? See ",(0,s.jsx)(n.a,{href:"https://webpack.js.org/guides/getting-started/#using-a-configuration",children:"Getting Started"}),"."]}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["The default output directory is ",(0,s.jsx)(n.code,{children:"dist/"}),"."]}),"\n",(0,s.jsxs)(n.li,{children:["The default output filename for JS and CSS files remains the original filename without a hash:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"[name].js"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"[name].css"})}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["The default output filename for assets is ",(0,s.jsx)(n.code,{children:"[hash][ext][query]"}),"."]}),"\n"]})}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The generated output:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"my-project/\n\u251c\u2500\u2500 dist/\n|   \u251c\u2500\u2500 d4711676b8bd60d6368c.png\n|   \u251c\u2500\u2500 f279449352a40ca7f10b.svg\n|   \u251c\u2500\u2500 vendor.css\n|   \u251c\u2500\u2500 vendor.js\n|   \u251c\u2500\u2500 index.html\n\u251c\u2500\u2500 src/\n"})})]})}function p(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},5537:(e,n,t)=>{t.d(n,{A:()=>k});var r=t(6540),s=t(4164),a=t(5627),l=t(6347),i=t(372),o=t(604),c=t(1861),u=t(8749);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:s}}=e;return{value:n,label:t,attributes:r,default:s}}))}(t);return function(e){const n=(0,c.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function p(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:t}=e;const s=(0,l.W6)(),a=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,o.aZ)(a),(0,r.useCallback)((e=>{if(!a)return;const n=new URLSearchParams(s.location.search);n.set(a,e),s.replace({...s.location,search:n.toString()})}),[a,s])]}function g(e){const{defaultValue:n,queryString:t=!1,groupId:s}=e,a=h(e),[l,o]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!p({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:a}))),[c,d]=m({queryString:t,groupId:s}),[g,b]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[s,a]=(0,u.Dv)(t);return[s,(0,r.useCallback)((e=>{t&&a.set(e)}),[t,a])]}({groupId:s}),f=(()=>{const e=c??g;return p({value:e,tabValues:a})?e:null})();(0,i.A)((()=>{f&&o(f)}),[f]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!p({value:e,tabValues:a}))throw new Error(`Can't select invalid tab value=${e}`);o(e),d(e),b(e)}),[d,b,a]),tabValues:a}}var b=t(9136);const f={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var x=t(4848);function j(e){let{className:n,block:t,selectedValue:r,selectValue:l,tabValues:i}=e;const o=[],{blockElementScrollPositionUntilNextRender:c}=(0,a.a_)(),u=e=>{const n=e.currentTarget,t=o.indexOf(n),s=i[t].value;s!==r&&(c(n),l(s))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const t=o.indexOf(e.currentTarget)+1;n=o[t]??o[0];break}case"ArrowLeft":{const t=o.indexOf(e.currentTarget)-1;n=o[t]??o[o.length-1];break}}n?.focus()};return(0,x.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":t},n),children:i.map((e=>{let{value:n,label:t,attributes:a}=e;return(0,x.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>{o.push(e)},onKeyDown:d,onClick:u,...a,className:(0,s.A)("tabs__item",f.tabItem,a?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function v(e){let{lazy:n,children:t,selectedValue:a}=e;const l=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=l.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:(0,s.A)("margin-top--md",e.props.className)}):null}return(0,x.jsx)("div",{className:"margin-top--md",children:l.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==a})))})}function y(e){const n=g(e);return(0,x.jsxs)("div",{className:(0,s.A)("tabs-container",f.tabList),children:[(0,x.jsx)(j,{...n,...e}),(0,x.jsx)(v,{...n,...e})]})}function k(e){const n=(0,b.A)();return(0,x.jsx)(y,{...e,children:d(e.children)},String(n))}},8453:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>i});var r=t(6540);const s={},a=r.createContext(s);function l(e){const n=r.useContext(a);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),r.createElement(a.Provider,{value:n},e.children)}},9329:(e,n,t)=>{t.d(n,{A:()=>l});t(6540);var r=t(4164);const s={tabItem:"tabItem_Ymn6"};var a=t(4848);function l(e){let{children:n,hidden:t,className:l}=e;return(0,a.jsx)("div",{role:"tabpanel",className:(0,r.A)(s.tabItem,l),hidden:t,children:n})}}}]);