"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[6705],{5537:(e,n,t)=>{t.d(n,{A:()=>y});var s=t(6540),l=t(4164),i=t(5627),a=t(6347),r=t(372),c=t(604),o=t(1861),u=t(8749);function d(e){return s.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,s.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:n,children:t}=e;return(0,s.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:s,default:l}}=e;return{value:n,label:t,attributes:s,default:l}}))}(t);return function(e){const n=(0,o.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function h(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:t}=e;const l=(0,a.W6)(),i=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,c.aZ)(i),(0,s.useCallback)((e=>{if(!i)return;const n=new URLSearchParams(l.location.search);n.set(i,e),l.replace({...l.location,search:n.toString()})}),[i,l])]}function g(e){const{defaultValue:n,queryString:t=!1,groupId:l}=e,i=p(e),[a,c]=(0,s.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!h({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const s=t.find((e=>e.default))??t[0];if(!s)throw new Error("Unexpected error: 0 tabValues");return s.value}({defaultValue:n,tabValues:i}))),[o,d]=m({queryString:t,groupId:l}),[g,b]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[l,i]=(0,u.Dv)(t);return[l,(0,s.useCallback)((e=>{t&&i.set(e)}),[t,i])]}({groupId:l}),x=(()=>{const e=o??g;return h({value:e,tabValues:i})?e:null})();(0,r.A)((()=>{x&&c(x)}),[x]);return{selectedValue:a,selectValue:(0,s.useCallback)((e=>{if(!h({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),b(e)}),[d,b,i]),tabValues:i}}var b=t(9136);const x={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var f=t(4848);function j(e){let{className:n,block:t,selectedValue:s,selectValue:a,tabValues:r}=e;const c=[],{blockElementScrollPositionUntilNextRender:o}=(0,i.a_)(),u=e=>{const n=e.currentTarget,t=c.indexOf(n),l=r[t].value;l!==s&&(o(n),a(l))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const t=c.indexOf(e.currentTarget)+1;n=c[t]??c[0];break}case"ArrowLeft":{const t=c.indexOf(e.currentTarget)-1;n=c[t]??c[c.length-1];break}}n?.focus()};return(0,f.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,l.A)("tabs",{"tabs--block":t},n),children:r.map((e=>{let{value:n,label:t,attributes:i}=e;return(0,f.jsx)("li",{role:"tab",tabIndex:s===n?0:-1,"aria-selected":s===n,ref:e=>{c.push(e)},onKeyDown:d,onClick:u,...i,className:(0,l.A)("tabs__item",x.tabItem,i?.className,{"tabs__item--active":s===n}),children:t??n},n)}))})}function v(e){let{lazy:n,children:t,selectedValue:i}=e;const a=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=a.find((e=>e.props.value===i));return e?(0,s.cloneElement)(e,{className:(0,l.A)("margin-top--md",e.props.className)}):null}return(0,f.jsx)("div",{className:"margin-top--md",children:a.map(((e,n)=>(0,s.cloneElement)(e,{key:n,hidden:e.props.value!==i})))})}function k(e){const n=g(e);return(0,f.jsxs)("div",{className:(0,l.A)("tabs-container",x.tabList),children:[(0,f.jsx)(j,{...n,...e}),(0,f.jsx)(v,{...n,...e})]})}function y(e){const n=(0,b.A)();return(0,f.jsx)(k,{...e,children:d(e.children)},String(n))}},7635:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>u,contentTitle:()=>o,default:()=>h,frontMatter:()=>c,metadata:()=>s,toc:()=>d});const s=JSON.parse('{"id":"getting-started/migrating-from-html-webpack-plugin","title":"Migrating from html-webpack-plugin","description":"Migrating from HTML Webpack Plugin","source":"@site/docs/getting-started/migrating-from-html-webpack-plugin.mdx","sourceDirName":"getting-started","slug":"/getting-started/migrating-from-html-webpack-plugin","permalink":"/html-bundler-webpack-plugin/getting-started/migrating-from-html-webpack-plugin","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/getting-started/migrating-from-html-webpack-plugin.mdx","tags":[],"version":"current","sidebarPosition":99,"frontMatter":{"sidebar_position":99,"title":"Migrating from html-webpack-plugin"},"sidebar":"docsSidebar","previous":{"title":"Playground","permalink":"/html-bundler-webpack-plugin/getting-started/playground"},"next":{"title":"Options","permalink":"/html-bundler-webpack-plugin/category/options"}}');var l=t(4848),i=t(8453),a=t(5537),r=t(9329);const c={sidebar_position:99,title:"Migrating from html-webpack-plugin"},o="",u={},d=[{value:"Migrating from HTML Webpack Plugin",id:"migrating-from-html-webpack-plugin",level:2},{value:"Multiple pages example",id:"multiple-pages-example",level:2},{value:"Step by step",id:"step-by-step",level:2},{value:"Step 1: Replace packages",id:"step-1-replace-packages",level:3},{value:"Step 2: Remove loaders",id:"step-2-remove-loaders",level:3},{value:"Step 3: Replace plugin",id:"step-3-replace-plugin",level:3},{value:"Step 4: Add <code>&lt;script&gt;</code> and <code>&lt;link&gt;</code> tags into HTML",id:"step-4-add-script-and-link-tags-into-html",level:3},{value:"Step 5: Check template variables",id:"step-5-check-template-variables",level:3},{value:"Step 6: Move JS output filename",id:"step-6-move-js-output-filename",level:3},{value:"Step 7: Move CSS output filename",id:"step-7-move-css-output-filename",level:3},{value:"Final Webpack config",id:"final-webpack-config",level:3}];function p(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n.header,{children:(0,l.jsx)(n.h1,{id:""})}),"\n",(0,l.jsx)(n.h2,{id:"migrating-from-html-webpack-plugin",children:"Migrating from HTML Webpack Plugin"}),"\n",(0,l.jsxs)(n.p,{children:["For years, configuring ",(0,l.jsx)(n.a,{href:"https://github.com/jantimon/html-webpack-plugin",children:"html-webpack-plugin"})," for multiple pages was a hassle.\nEach page required manually defining the ",(0,l.jsx)(n.code,{children:"chunks"}),' option to reference JavaScript files from the entry configuration,\nleading to a frustrating "chunks hell" configuration.']}),"\n",(0,l.jsxs)(n.p,{children:["Also, ",(0,l.jsx)(n.code,{children:"html-webpack-plugin"}),' alone is not enough. Rendering an HTML template containing JS, CSS, SVG, images and other assets requires additional "crutches" as plugins for ',(0,l.jsx)(n.code,{children:"html-webpack-plugin"}),", as well additional plugins and loaders."]}),"\n",(0,l.jsx)(n.p,{children:"Thus, this plugin requires a whole bunch of additional plugins and loaders, many of which have not been supported for a long time, which limits the use of the plugin itself."}),"\n",(0,l.jsxs)(n.p,{children:["To solve this and many other problems,\nwas created ",(0,l.jsx)(n.code,{children:"html-bundler-webpack-plugin"}),' \u2014 an "all-in-one" solution that simplifies HTML handling\nand automatically manages asset dependencies with ease.']}),"\n",(0,l.jsx)(n.h2,{id:"multiple-pages-example",children:"Multiple pages example"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-text",children:"my-project/\n\u251c\u2500\u2500 dist/  (generated output)\n\u251c\u2500\u2500 src/\n\u2502   \u251c\u2500\u2500 scripts/\n\u2502   \u2502   \u251c\u2500\u2500 main.js\n\u2502   \u251c\u2500\u2500 pages/\n\u2502   \u2502   \u251c\u2500\u2500 home/\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 index.html\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 style.scss\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 script.js\n\u2502   \u2502   \u251c\u2500\u2500 about/\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 index.html\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 style.scss\n\u2502   \u2502   \u2502   \u251c\u2500\u2500 script.js\n\u251c\u2500\u2500 webpack.config.js\n\u2514\u2500\u2500 package.json\n"})}),"\n",(0,l.jsxs)(a.A,{groupId:"home",children:[(0,l.jsx)(r.A,{value:"html",label:"src/pages/home/index.html",children:(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-html",children:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title><%= htmlWebpackPlugin.options.title %></title>\n</head>\n<body>\n  <h1>Home</h1>\n</body>\n</html>\n'})})}),(0,l.jsx)(r.A,{value:"js",label:"src/pages/home/script.js",children:(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-js",children:"// empty JS is only needed to import a page-specifically style\nimport './style.scss'\n"})})}),(0,l.jsx)(r.A,{value:"scss",label:"src/pages/home/style.scss",children:(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-scss",children:"h1 {\n  color: green;\n}\n"})})})]}),"\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.strong,{children:"Webpack config"}),":"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-js",children:"const path = require('path');\nconst MiniCssExtractPlugin = require('mini-css-extract-plugin');\nconst HtmlWebpackPlugin = require('html-webpack-plugin');\n\nmodule.exports = {\n  output: {\n    filename: 'js/[name].[contenthash:8].js'\n  },\n  entry: {\n    main: './src/scripts/main.js',\n    home: './src/pages/home/script.js',\n    about: './src/pages/about/script.js',\n  },\n  plugins: [\n    new MiniCssExtractPlugin({\n      filename: 'css/[name].[contenthash:8].css',\n    }),\n    new HtmlWebpackPlugin({\n      template: './src/pages/home/index.html',\n      filename: 'index.html', // Output dist/index.html\n      title: 'Home',\n      chunks: ['main', 'home'], // Include scripts in this template\n      inject: 'body',\n    }),\n    new HtmlWebpackPlugin({\n      template: './src/pages/about/index.html',\n      filename: 'about.html', // Output dist/about.html\n      title: 'About',\n      chunks: ['main', 'about'], // Include scripts in this template\n      inject: 'body',\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.s?css$/,\n        use: [\n          MiniCssExtractPlugin.loader,\n          'css-loader',\n          'sass-loader',\n        ],\n      },\n    ],\n  },\n};\n"})}),"\n",(0,l.jsx)(n.h2,{id:"step-by-step",children:"Step by step"}),"\n",(0,l.jsx)(n.h3,{id:"step-1-replace-packages",children:"Step 1: Replace packages"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"html-bundler-webpack-plugin"})," replaces the functionality of ",(0,l.jsx)(n.code,{children:"html-webpack-plugin"}),", ",(0,l.jsx)(n.code,{children:"mini-css-extract-plugin"}),", and other ",(0,l.jsx)(n.a,{href:"/introduction#related-plugins-and-loaders",children:"plugins and loaders"}),":"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"- const MiniCssExtractPlugin = require('mini-css-extract-plugin');\n- const HtmlWebpackPlugin = require('html-webpack-plugin');\n+ const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n"})}),"\n",(0,l.jsx)(n.h3,{id:"step-2-remove-loaders",children:"Step 2: Remove loaders"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"html-bundler-webpack-plugin"})," extracts CSS automatically."]}),"\n",(0,l.jsxs)(n.p,{children:["Remove ",(0,l.jsx)(n.code,{children:"MiniCssExtractPlugin.loader"})," from the module rule:"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"{\n  test: /\\.s?css$/,\n  use: [\n-    MiniCssExtractPlugin.loader,\n    'css-loader',\n    'sass-loader',\n  ],\n},\n"})}),"\n",(0,l.jsxs)(n.p,{children:["Or if used ",(0,l.jsx)(n.code,{children:"style-loader"}),", remove it from the module rule:"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"{\n  test: /\\.s?css$/,\n  use: [\n-   'style-loader',\n    'css-loader',\n    'sass-loader',\n  ],\n},\n"})}),"\n",(0,l.jsx)(n.h3,{id:"step-3-replace-plugin",children:"Step 3: Replace plugin"}),"\n",(0,l.jsxs)(n.p,{children:["Replace all ",(0,l.jsx)(n.code,{children:"HtmlWebpackPlugin"})," with single ",(0,l.jsx)(n.code,{children:"HtmlBundlerPlugin"}),":"]}),"\n",(0,l.jsxs)(n.ul,{children:["\n",(0,l.jsxs)(n.li,{children:["Place the options object of each ",(0,l.jsx)(n.code,{children:"HtmlWebpackPlugin"})," instance into ",(0,l.jsxs)(n.a,{href:"/plugin-options-entry#entry-collection",children:[(0,l.jsx)(n.code,{children:"entry"})," collection"]})," of ",(0,l.jsx)(n.code,{children:"HtmlBundlerPlugin"}),"."]}),"\n",(0,l.jsxs)(n.li,{children:["Rename the ",(0,l.jsx)(n.code,{children:"template"})," property to ",(0,l.jsx)(n.code,{children:"import"}),"."]}),"\n",(0,l.jsxs)(n.li,{children:["Place template variables, e.g. ",(0,l.jsx)(n.code,{children:"title"}),", into ",(0,l.jsxs)(n.a,{href:"/plugin-options-entry#data-as-object",children:[(0,l.jsx)(n.code,{children:"data"})," option"]}),"."]}),"\n",(0,l.jsxs)(n.li,{children:["Remove needless options, such as ",(0,l.jsx)(n.code,{children:"chunks"}),", ",(0,l.jsx)(n.code,{children:"chunksSortMode"}),", ",(0,l.jsx)(n.code,{children:"excludeChunks"}),", ",(0,l.jsx)(n.code,{children:"inject"}),", etc."]}),"\n"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"plugins: [\n-  new HtmlWebpackPlugin({\n-    template: './src/pages/home/index.html',\n-    filename: 'index.html', // Output dist/index.html\n-    title: 'Home',\n-    chunks: ['main', 'home'], // Include scripts in this template\n-    inject: 'body',\n-  }),\n-  new HtmlWebpackPlugin({\n-    template: './src/pages/about/index.html',\n-    filename: 'about.html', // Output dist/about.html\n-    title: 'About',\n-    chunks: ['main', 'about'], // Include scripts in this template\n-    inject: 'body',\n-  }),\n+  new HtmlBundlerPlugin({\n+    entry: [\n+      {\n+        import: './src/pages/home/index.html',\n+        filename: 'index.html', // Output dist/index.html\n+        data: { title: 'Home', },\n+      },\n+      {\n+        import: './src/pages/about/index.html',\n+        filename: 'about.html', // Output dist/about.html\n+        data: { title: 'About', },\n+      },\n+    ],\n+  }),\n],\n"})}),"\n",(0,l.jsxs)(n.h3,{id:"step-4-add-script-and-link-tags-into-html",children:["Step 4: Add ",(0,l.jsx)(n.code,{children:"<script>"})," and ",(0,l.jsx)(n.code,{children:"<link>"})," tags into HTML"]}),"\n",(0,l.jsx)(n.p,{children:"Specify source script and style files in an HTML template using a relative path or a Webpack alias:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:'<!DOCTYPE html>\n<html lang="en">\n  <head>\n+   <link href="./style.scss" rel="stylesheet">\n  </head>\n  <body>\n    ...\n+   <script src="../../scripts/main.js"><\/script>\n  </body>\n</html>\n'})}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsx)(n.admonition,{type:"tip",children:(0,l.jsxs)(n.p,{children:["Use Webpack aliases to avoid relative paths like ",(0,l.jsx)(n.code,{children:"../../scripts/main.js"}),":"]})}),"\n"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:'- <script src="../../scripts/main.js"><\/script>\n+ <script src="@scripts/main.js"><\/script>\n'})}),"\n",(0,l.jsx)(n.p,{children:"Specify aliases in the Webpack config:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"module.exports = {\n+  resolve: {\n+    alias: {\n+      '@scripts': path.join(__dirname, 'src/scripts'),\n+    },\n+  },\n};\n"})}),"\n",(0,l.jsx)(n.p,{children:"Remove Webpack entry option, because your scripts and styles are specified directly in HTML:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"module.exports = {\n-  entry: {\n-    main: './src/scripts/main.js',\n-    home: './src/pages/home/script.js',\n-    about: './src/pages/about/script.js',\n-  },\n};\n"})}),"\n",(0,l.jsx)(n.p,{children:"Optional: delete empty JS files containing imported styles only, because source styles specified directly in HTML."}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsx)(n.admonition,{type:"info",children:(0,l.jsx)(n.p,{children:"The plugin supports imported styles in JS, so you can leave it as is."})}),"\n"]}),"\n",(0,l.jsx)(n.h3,{id:"step-5-check-template-variables",children:"Step 5: Check template variables"}),"\n",(0,l.jsxs)(n.p,{children:["The template variables defined in the ",(0,l.jsx)(n.code,{children:"data"})," option are available in a template w/o any prefix.\nJust remove ",(0,l.jsx)(n.code,{children:"htmlWebpackPlugin.options."})," in the template:"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"- <title><%= htmlWebpackPlugin.options.title %></title>\n+ <title><%= title %></title>\n"})}),"\n",(0,l.jsx)(n.h3,{id:"step-6-move-js-output-filename",children:"Step 6: Move JS output filename"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"module.exports = {\n  output: {\n-    filename: 'js/[name].[contenthash:8].js',\n  },\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: [ ... ],\n+     js: {\n+       filename: 'js/[name].[contenthash:8].js',\n+     },\n    }),\n  ],\n};\n"})}),"\n",(0,l.jsx)(n.h3,{id:"step-7-move-css-output-filename",children:"Step 7: Move CSS output filename"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-diff",children:"module.exports = {\n  plugins: [\n-   new MiniCssExtractPlugin({\n-     filename: 'css/[name].[contenthash:8].css',\n-   }),\n    new HtmlBundlerPlugin({\n      entry: [ ... ],\n      js: { ... },\n+     css: {\n+       filename: 'css/[name].[contenthash:8].css',\n+     },\n    }),\n  ],\n};\n"})}),"\n",(0,l.jsx)(n.h3,{id:"final-webpack-config",children:"Final Webpack config"}),"\n",(0,l.jsxs)(a.A,{groupId:"configs",children:[(0,l.jsx)(r.A,{value:"HtmlBundlerPlugin",label:"NEW: using HtmlBundlerPlugin",children:(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-js",children:"const path = require('path');\nconst HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nmodule.exports = {\n  resolve: {\n    alias: {\n      '@scripts': path.join(__dirname, 'src/scripts'),\n    },\n  },\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: [\n        {\n          import: './src/pages/home/index.html',\n          filename: 'index.html', // Output dist/index.html\n          data: { title: 'Home', },\n        },\n        {\n          import: './src/pages/about/index.html',\n          filename: 'about.html', // Output dist/about.html\n          data: { title: 'About', },\n        },\n      ],\n      js: {\n        filename: 'js/[name].[contenthash:8].js',\n      },\n      css: {\n        filename: 'css/[name].[contenthash:8].css',\n      },\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.s?css$/,\n        use: [\n          'css-loader',\n          'sass-loader',\n        ],\n      },\n    ],\n  },\n};\n"})})}),(0,l.jsx)(r.A,{value:"HtmlWebpackPlugin",label:"OLD: using HtmlWebpackPlugin",children:(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-js",children:"const path = require('path');\nconst MiniCssExtractPlugin = require('mini-css-extract-plugin');\nconst HtmlWebpackPlugin = require('html-webpack-plugin');\n\nmodule.exports = {\n  output: {\n    filename: 'js/[name].[contenthash:8].js'\n  },\n  entry: {\n    main: './src/scripts/main.js',\n    home: './src/pages/home/script.js',\n    about: './src/pages/about/script.js',\n  },\n  plugins: [\n    new MiniCssExtractPlugin({\n      filename: 'css/[name].[contenthash:8].css',\n    }),\n    new HtmlWebpackPlugin({\n      template: './src/pages/home/index.html',\n      filename: 'index.html', // Output dist/index.html\n      title: 'Home',\n      chunks: ['main', 'home'], // Include scripts in this template\n      inject: 'body',\n    }),\n    new HtmlWebpackPlugin({\n      template: './src/pages/about/index.html',\n      filename: 'about.html', // Output dist/about.html\n      title: 'About',\n      chunks: ['main', 'about'], // Include scripts in this template\n      inject: 'body',\n    }),\n  ],\n  module: {\n    rules: [\n      {\n        test: /\\.s?css$/,\n        use: [\n          MiniCssExtractPlugin.loader,\n          'css-loader',\n          'sass-loader',\n        ],\n      },\n    ],\n  },\n};\n"})})})]})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,l.jsx)(n,{...e,children:(0,l.jsx)(p,{...e})}):p(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>r});var s=t(6540);const l={},i=s.createContext(l);function a(e){const n=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:a(e.components),s.createElement(i.Provider,{value:n},e.children)}},9329:(e,n,t)=>{t.d(n,{A:()=>a});t(6540);var s=t(4164);const l={tabItem:"tabItem_Ymn6"};var i=t(4848);function a(e){let{children:n,hidden:t,className:a}=e;return(0,i.jsx)("div",{role:"tabpanel",className:(0,s.A)(l.tabItem,a),hidden:t,children:n})}}}]);