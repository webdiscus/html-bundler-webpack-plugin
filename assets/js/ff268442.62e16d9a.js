"use strict";(self.webpackChunkhtml_bundler_docs=self.webpackChunkhtml_bundler_docs||[]).push([[577],{4889:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>h,frontMatter:()=>c,metadata:()=>t,toc:()=>o});const t=JSON.parse('{"id":"Options/PluginOptions/sources","title":"sources","description":"Option: sources","source":"@site/docs/Options/PluginOptions/sources.mdx","sourceDirName":"Options/PluginOptions","slug":"/plugin-options-sources","permalink":"/html-bundler-webpack-plugin/plugin-options-sources","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-docs/tree/docusaurus/docs/Options/PluginOptions/sources.mdx","tags":[{"inline":true,"label":"HTML","permalink":"/html-bundler-webpack-plugin/tags/html"},{"inline":true,"label":"source","permalink":"/html-bundler-webpack-plugin/tags/source"},{"inline":true,"label":"resolve","permalink":"/html-bundler-webpack-plugin/tags/resolve"},{"inline":true,"label":"template","permalink":"/html-bundler-webpack-plugin/tags/template"}],"version":"current","sidebarPosition":80,"frontMatter":{"sidebar_position":80,"slug":"/plugin-options-sources","title":"sources","tags":["HTML","source","resolve","template"]},"sidebar":"docsSidebar","previous":{"title":"router","permalink":"/html-bundler-webpack-plugin/plugin-options-router"},"next":{"title":"filename","permalink":"/html-bundler-webpack-plugin/plugin-options-filename"}}');var r=s(4848),i=s(8453);const c={sidebar_position:80,slug:"/plugin-options-sources",title:"sources",tags:["HTML","source","resolve","template"]},l="Resolve source files in template",d={},o=[{value:"Default attributes",id:"default-attributes",level:3},{value:"<code>filter</code> function",id:"filter-function",level:3}];function a(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",br:"br",code:"code",h1:"h1",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"resolve-source-files-in-template",children:"Resolve source files in template"})}),"\n",(0,r.jsxs)(n.p,{children:["Option: ",(0,r.jsx)(n.code,{children:"sources"})]}),"\n",(0,r.jsx)(n.p,{children:"Type:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"type Sources =\n  | boolean\n  | Array<{\n      tag?: string;\n      attributes?: Array<string>;\n      filter?: (props: {\n        tag: string;\n        attribute: string;\n        value: string;\n        parsedValue: Array<string>;\n        attributes: { [attributeName: string]: string };\n        resourcePath: string;\n      }) => boolean | void;\n    }>;\n"})}),"\n",(0,r.jsxs)(n.p,{children:["Default: ",(0,r.jsx)(n.code,{children:"true"})]}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"sources"})," option allow to specify a tag attribute that should be resolved."]}),"\n",(0,r.jsx)(n.h3,{id:"default-attributes",children:"Default attributes"}),"\n",(0,r.jsx)(n.p,{children:"By default, resolves source files in the following tags and attributes:"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Tag"}),(0,r.jsx)(n.th,{children:"Attributes"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"link"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"href"})," for ",(0,r.jsx)(n.code,{children:'type="text/css"'}),", ",(0,r.jsx)(n.code,{children:'rel="stylesheet"'}),", ",(0,r.jsx)(n.code,{children:'as="style"'}),", ",(0,r.jsx)(n.code,{children:'as="script"'}),(0,r.jsx)("br",{}),(0,r.jsx)(n.code,{children:"imagesrcset"})," for ",(0,r.jsx)(n.code,{children:'as="image"'})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"script"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"src"})})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"img"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"src"})," ",(0,r.jsx)(n.code,{children:"srcset"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"image"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"href"})," ",(0,r.jsx)(n.code,{children:"xlink:href"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"use"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"href"})," ",(0,r.jsx)(n.code,{children:"xlink:href"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"input"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"src"})," (for ",(0,r.jsx)(n.code,{children:'type="image"'}),")"]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"source"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"src"})," ",(0,r.jsx)(n.code,{children:"srcset"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"audio"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"src"})})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"track"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"src"})})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"video"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"src"})," ",(0,r.jsx)(n.code,{children:"poster"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"object"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"data"})})]})]})]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsx)(n.admonition,{type:"warning",children:(0,r.jsxs)(n.p,{children:["It is not recommended to use the ",(0,r.jsx)(n.a,{href:"https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xlink:href",children:"deprecated"})," ",(0,r.jsx)(n.code,{children:"xlink:href"})," attribute by the ",(0,r.jsx)(n.code,{children:"image"})," and ",(0,r.jsx)(n.code,{children:"use"})," tags."]})}),"\n"]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.admonition,{type:"note",children:[(0,r.jsx)(n.p,{children:"Automatically are processed only attributes containing a relative path or Webpack alias:"}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:'src="./image.png"'})," or ",(0,r.jsx)(n.code,{children:'src="image.png"'})," - an asset in the local directory"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:'src="../../assets/image.png"'})," - a relative path to parent directory"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:'src="@images/image.png"'})," - an image directory as Webpack alias"]}),"\n"]}),"\n"]}),(0,r.jsx)(n.p,{children:"Url values are not processed:"}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:'src="https://example.com/img/image.png"'})}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:'src="//example.com/img/image.png"'})}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:'src="/img/image.png"'})," (not processed only if not defined the ",(0,r.jsxs)(n.a,{href:"/loader-options-root",children:[(0,r.jsx)(n.code,{children:"root"})," option"]}),")"]}),"\n"]}),"\n"]}),(0,r.jsx)(n.p,{children:"Others not filename values are ignored, e.g.:"}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:'src="data:image/png; ..."'})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:'src="javascript: ..."'})}),"\n"]})]}),"\n"]}),"\n",(0,r.jsxs)(n.h3,{id:"filter-function",children:[(0,r.jsx)(n.code,{children:"filter"})," function"]}),"\n",(0,r.jsxs)(n.p,{children:["Using the ",(0,r.jsx)(n.code,{children:"filter"})," function, you can enable/disable resolving of specific assets by tags and attributes."]}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"filter"})," is called for all attributes of the tag defined as defaults and in ",(0,r.jsx)(n.code,{children:"sources"})," option.\nThe argument is an object containing the properties:"]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"tag: string"})," - a name of the HTML tag"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"attribute: string"})," - a name of the HTML attribute"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"value: string"})," - an original value of the HTML attribute"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"parsedValue: Array<string>"})," - an array of filenames w/o URL query, parsed in the value",(0,r.jsx)(n.br,{}),"\n","it's useful for the ",(0,r.jsx)(n.code,{children:"srcset"})," attribute containing many image files, e.g.:"]}),"\n"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-html",children:'<img src="image.png?size=800" srcset="image1.png?size=200 200w, image2.png 400w">\n'})}),"\n",(0,r.jsxs)(n.p,{children:["the ",(0,r.jsx)(n.code,{children:"parsedValue"})," for the ",(0,r.jsx)(n.code,{children:"src"})," is ",(0,r.jsx)(n.code,{children:"['image.png']"}),", the array with one parsed filename",(0,r.jsx)(n.br,{}),"\n","the ",(0,r.jsx)(n.code,{children:"parsedValue"})," for the ",(0,r.jsx)(n.code,{children:"srcset"})," is ",(0,r.jsx)(n.code,{children:"['image1.png', 'image2.png']"})]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"attributes: { [attributeName: string]: string }"})," - all attributes of the tag"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"resourcePath: string"})," - a path of the HTML template"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The processing of an attribute can be ignored by returning ",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsxs)(n.p,{children:["To disable the processing of all attributes, set the ",(0,r.jsx)(n.code,{children:"sources"})," option as ",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsx)(n.p,{children:"Examples of using argument properties:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"{\n  tag: 'img',\n  // use the destructuring of variables from the object argument\n  filter: ({ tag, attribute, value, attributes, resourcePath }) => {\n    if (attribute === 'src') return false;\n    if (value.endsWith('.webp')) return false;\n    if ('srcset' in attributes && attributes['srcset'] === '') return false;\n    if (resourcePath.includes('example')) return false;\n    // otherwise return 'true' or nothing (undefined) to allow the processing\n  },\n}\n"})}),"\n",(0,r.jsx)(n.p,{children:"The default sources can be extended with new tags and attributes."}),"\n",(0,r.jsxs)(n.p,{children:["For example, enable the processing for the non-standard ",(0,r.jsx)(n.code,{children:"data-src"})," and ",(0,r.jsx)(n.code,{children:"data-srcset"})," attributes in the ",(0,r.jsx)(n.code,{children:"img"})," tag:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"new HtmlBundlerPlugin({\n  entry: {\n    index: 'src/views/index.html',\n  },\n  loaderOptions: {\n    sources: [\n      {\n        tag: 'img',\n        attributes: ['data-src', 'data-srcset'],\n      },\n    ],\n  },\n});\n"})}),"\n",(0,r.jsxs)(n.p,{children:["You can use the ",(0,r.jsx)(n.code,{children:"filter"})," function to allow the processing only specific attributes."]}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"filter"})," function must return ",(0,r.jsx)(n.code,{children:"true"})," or ",(0,r.jsx)(n.code,{children:"undefined"})," to enable the processing of specified tag attributes.\nReturn ",(0,r.jsx)(n.code,{children:"false"})," to disable the processing."]}),"\n",(0,r.jsxs)(n.p,{children:["For example, allow processing only for images in ",(0,r.jsx)(n.code,{children:"content"})," attribute of the ",(0,r.jsx)(n.code,{children:"meta"})," tag:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-html",children:'<html>\n  <head>\n    \x3c!-- ignore the \'content\' attribute via filter --\x3e\n    <meta name="theme-color" content="#ffffff" />\n    <meta property="og:title" content="Fruits" />\n    <meta property="og:image:type" content="image/png" />\n    <meta property="og:video:type" content="video/mp4" />\n\n    \x3c!-- resolve the \'content\' attribute via filter  --\x3e\n    <meta property="og:image" content="./fruits.png" />\n    <meta property="og:video" content="./video.mp4" />\n  </head>\n  <body>\n    \x3c!-- resolve standard \'src\' attribute --\x3e\n    <img src="./image.png" />\n  </body>\n</html>\n'})}),"\n",(0,r.jsxs)(n.p,{children:["Use the ",(0,r.jsx)(n.code,{children:"filter"})," function:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"new HtmlBundlerPlugin({\n  entry: {\n    index: 'src/views/index.html',\n  },\n  loaderOptions: {\n    sources: [\n      {\n        tag: 'meta',\n        attributes: ['content'],\n        // allow to handle an image in the 'content' attribute of the 'meta' tag\n        // when the 'property' attribute contains one of: 'og:image', 'og:video'\n        filter: ({ attributes }) => {\n          const attrName = 'property';\n          const attrValues = ['og:image', 'og:video']; // allowed values of the property\n          if (!attributes[attrName] || attrValues.indexOf(attributes[attrName]) < 0) {\n            return false; // return false to disable processing\n          }\n          // return true or undefined to enable processing\n        },\n      },\n    ],\n  },\n});\n"})}),"\n",(0,r.jsx)(n.p,{children:"The filter can disable an attribute of a tag."}),"\n",(0,r.jsxs)(n.p,{children:["For example, disable the processing of default attribute ",(0,r.jsx)(n.code,{children:"srcset"})," of the ",(0,r.jsx)(n.code,{children:"img"})," tag:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"new HtmlBundlerPlugin({\n  entry: {\n    index: 'src/views/index.html',\n  },\n  loaderOptions: {\n    sources: [\n      {\n        tag: 'img',\n        filter: ({ attribute }) => attribute !== 'srcset',\n      },\n    ],\n  },\n});\n"})}),"\n",(0,r.jsxs)(n.p,{children:["See also an example of using the ",(0,r.jsx)(n.code,{children:"filter"})," function: ",(0,r.jsxs)(n.a,{href:"/guides/resolve-image-in-href",children:["How to resolve source image in ",(0,r.jsx)(n.code,{children:'<a href="image.jpg">'})]}),"."]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsx)(n.admonition,{type:"info",children:(0,r.jsxs)(n.p,{children:["This option is the reference to ",(0,r.jsx)(n.code,{children:"loaderOptions.sources"}),"."]})}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>c,x:()=>l});var t=s(6540);const r={},i=t.createContext(r);function c(e){const n=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),t.createElement(i.Provider,{value:n},e.children)}}}]);