"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[7910],{1846:(e,n,s)=>{s.d(n,{A:()=>o});const o=s.p+"assets/images/hooks-49efa29e2321263ad7eba19d8b26fed5.png"},3435:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>l,default:()=>d,frontMatter:()=>i,metadata:()=>o,toc:()=>c});const o=JSON.parse('{"id":"hooks-and-callbacks","title":"Hooks & Callbacks","description":"Using hooks and callbacks, you can extend the functionality of this plugin.","source":"@site/docs/hooks-and-callbacks.md","sourceDirName":".","slug":"/hooks-and-callbacks","permalink":"/html-bundler-webpack-plugin/hooks-and-callbacks","draft":false,"unlisted":false,"editUrl":"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/docs/hooks-and-callbacks.md","tags":[],"version":"current","sidebarPosition":99,"frontMatter":{"sidebar_position":99},"sidebar":"docsSidebar","previous":{"title":"FaviconsBundlerPlugin","permalink":"/html-bundler-webpack-plugin/Plugins/favicons"}}');var t=s(4848),r=s(8453);const i={sidebar_position:99},l="Hooks & Callbacks",a={},c=[{value:"When using <code>callbacks</code>",id:"when-using-callbacks",level:2},{value:"When using <code>hooks</code>",id:"when-using-hooks",level:2},{value:"How to use hooks",id:"how-to-use-hooks",level:2},{value:"Hooks",id:"hooks",level:2},{value:"<code>beforePreprocessor</code>",id:"beforepreprocessor",level:3},{value:"<code>preprocessor</code>",id:"preprocessor",level:3},{value:"<code>resolveSource</code>",id:"resolvesource",level:3},{value:"<code>postprocess</code>",id:"postprocess",level:3},{value:"<code>beforeEmit</code>",id:"beforeemit",level:3},{value:"<code>afterEmit</code>",id:"afteremit",level:3},{value:"<code>integrityHashes</code>",id:"integrityhashes",level:3}];function h(e){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",img:"img",li:"li",p:"p",pre:"pre",ul:"ul",...(0,r.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"hooks--callbacks",children:"Hooks & Callbacks"})}),"\n",(0,t.jsx)(n.p,{children:"Using hooks and callbacks, you can extend the functionality of this plugin."}),"\n",(0,t.jsxs)(n.p,{children:["The ",(0,t.jsx)(n.code,{children:"hook"})," can be defined in an external plugin.\nThe ",(0,t.jsx)(n.code,{children:"callback"})," is defined as an option in the HTMLBundlerPlugin."]}),"\n",(0,t.jsx)(n.p,{children:"Most hooks have a callback with the same name.\nEach callback is called after hook with the same name.\nSo with a callback, you can change the result of the hook."}),"\n",(0,t.jsxs)(n.h2,{id:"when-using-callbacks",children:["When using ",(0,t.jsx)(n.code,{children:"callbacks"})]}),"\n",(0,t.jsx)(n.p,{children:"If you have small code just for your project or are doing debugging, you can use callbacks."}),"\n",(0,t.jsxs)(n.h2,{id:"when-using-hooks",children:["When using ",(0,t.jsx)(n.code,{children:"hooks"})]}),"\n",(0,t.jsx)(n.p,{children:"Using hooks you can create your own plugin."}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.em,{children:"How the plugin works under the hood."})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"Hooks &amp; callbacks",src:s(1846).A+"",width:"765",height:"1120"})}),"\n",(0,t.jsx)(n.h2,{id:"how-to-use-hooks",children:"How to use hooks"}),"\n",(0,t.jsxs)(n.p,{children:["The simplest way, add the ",(0,t.jsx)(n.code,{children:"{ apply() { ... } }"})," object to the array of the Webpack plugins:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nmodule.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: './src/index.html',\n      },\n    }),\n    // your plugin\n    {\n      apply(compiler) {\n        const pluginName = 'MyPlugin';\n\n        compiler.hooks.compilation.tap(pluginName, (compilation) => {\n          const hooks = HtmlBundlerPlugin.getHooks(compilation);\n\n          // modify generated HTML of the index.html template\n          hooks.beforeEmit.tap(pluginName, (content, { name, sourceFile, assetFile }) => {\n            return content.replace('something...', 'other...')\n          });\n        });\n      },\n    },\n  ],\n};\n"})}),"\n",(0,t.jsx)(n.p,{children:"You can use this template as the basis for your own plugin:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\n\nclass MyPlugin {\n  pluginName = 'my-plugin';\n  options = {};\n\n  /**\n   * @param {{ enabled: boolean | 'auto'}} options The options of your plugin.\n   */\n  constructor(options = {}) {\n    this.options = options;\n  }\n\n  apply(compiler) {\n    // you can use the API of the HtmlBundlerPlugin.option\n    const enabled = HtmlBundlerPlugin.option.toBool(this.options?.enabled, true, 'auto');\n    const outputPath = HtmlBundlerPlugin.option.getWebpackOutputPath();\n\n    if (!enabled) {\n      return;\n    }\n\n    const { pluginName } = this;\n    const { webpack } = compiler; // instance of the Webpack\n    const fs = compiler.inputFileSystem.fileSystem; // instance of the Webpack FileSystem\n\n    // start your plugin from the webpack compilation hook\n    compiler.hooks.compilation.tap(pluginName, (compilation) => {\n      const hooks = HtmlBundlerPlugin.getHooks(compilation);\n\n      // usage of the sync, async and promise hooks\n\n      // sync hook\n      hooks.<hookName>.tap(pluginName, (...arguments) => {\n        // do somthing here ...\n        const result = 'your result';\n        // return the result\n        return result;\n      });\n\n      // async hook\n      hooks.<hookName>.tapAsync(pluginName, (...arguments, callback) => {\n        // do somthing here ...\n        const result = 'your result';\n        // call the callback function to resolve the async hook\n        callback(result);\n      });\n\n      // promise hook\n      hooks.<hookName>.tapPromise(pluginName, (...arguments) => {\n        // do somthing here ...\n        const result = 'your result';\n        // return the promise with the result\n        return Promise.resolve(result);\n      });\n    });\n  }\n}\n\nmodule.exports = MyPlugin;\n"})}),"\n",(0,t.jsx)(n.p,{children:"Then add your plugin in the webpack config:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\nconst MyBundlerPlugin = require('my-bundler-plugin');\n\nmodule.exports = {\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: './src/index.html',\n      },\n    }),\n    // your plugin\n    new MyBundlerPlugin({ enabled: true });\n  ],\n};\n"})}),"\n",(0,t.jsxs)(n.p,{children:["For an example implementation see ",(0,t.jsx)(n.a,{href:"https://github.com/webdiscus/html-bundler-webpack-plugin/tree/master/plugins/favicons-bundler-plugin",children:"FaviconsBundlerPlugin"}),"."]}),"\n",(0,t.jsx)(n.h2,{id:"hooks",children:"Hooks"}),"\n",(0,t.jsx)(n.h3,{id:"beforepreprocessor",children:(0,t.jsx)(n.code,{children:"beforePreprocessor"})}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"AsyncSeriesWaterfallHook<[\n  content: string,\n  loaderContext: LoaderContext<Object> & { data: { [key: string]: any } | string }\n]>;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["For details on ",(0,t.jsx)(n.code,{children:"AsyncSeriesWaterfallHook"})," see the ",(0,t.jsx)(n.a,{href:"https://github.com/webpack/tapable#hookhookmap-interface",children:"hook interface"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["For details on hook parameters, see in the ",(0,t.jsx)(n.a,{href:"#loader-option-before-preprocessor",children:"beforePreprocessor"})," callback option."]}),"\n",(0,t.jsx)(n.h3,{id:"preprocessor",children:(0,t.jsx)(n.code,{children:"preprocessor"})}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"AsyncSeriesWaterfallHook<[\n  content: string,\n  loaderContext: LoaderContext<Object> & { data: { [key: string]: any } | string }\n]>;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["For details on ",(0,t.jsx)(n.code,{children:"AsyncSeriesWaterfallHook"})," see the ",(0,t.jsx)(n.a,{href:"https://github.com/webpack/tapable#hookhookmap-interface",children:"hook interface"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["For details on hook parameters, see in the ",(0,t.jsx)(n.a,{href:"#loader-option-preprocessor-custom",children:"preprocessor"})," callback option."]}),"\n",(0,t.jsx)(n.h3,{id:"resolvesource",children:(0,t.jsx)(n.code,{children:"resolveSource"})}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"SyncWaterfallHook<[\n  source: string,\n  info: {\n    type: 'style' | 'script' | 'asset';\n    tag: string;\n    attribute: string;\n    value: string;\n    resolvedFile: string;\n    issuer: string\n  },\n]>;\n"})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.em,{children:"no calback"})}),"\n",(0,t.jsxs)(n.p,{children:["Called after resolving of a source attribute defined by ",(0,t.jsx)(n.a,{href:"#loader-option-sources",children:"source"})," loader option."]}),"\n",(0,t.jsxs)(n.p,{children:["For details on ",(0,t.jsx)(n.code,{children:"SyncWaterfallHook"})," see the ",(0,t.jsx)(n.a,{href:"https://github.com/webpack/tapable#hookhookmap-interface",children:"hook interface"}),"."]}),"\n",(0,t.jsx)(n.p,{children:"Hook parameters:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"source"})," - a source of the tag where are parsed attributes, e.g. ",(0,t.jsx)(n.code,{children:'<link href="./favicon.png" rel="icon">'})]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"info"})," - an object with parsed information:","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"type"})," - the type of the tag"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"tag"})," - the tag name, e.g. ",(0,t.jsx)(n.code,{children:"'link'"}),", ",(0,t.jsx)(n.code,{children:"'script'"}),", ",(0,t.jsx)(n.code,{children:"'img'"}),", etc."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"attribute"})," - the attribute name, e.g. ",(0,t.jsx)(n.code,{children:"'src'"}),", ",(0,t.jsx)(n.code,{children:"'href'"}),", etc."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"value"})," - the attribute value"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"resolvedFile"})," - the resolved file from the value"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"issuer"})," - the template file"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["Return a string to override the resolved value of the attribute or ",(0,t.jsx)(n.code,{children:"undefined"})," to keep the resolved value."]}),"\n",(0,t.jsx)(n.h3,{id:"postprocess",children:(0,t.jsx)(n.code,{children:"postprocess"})}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"AsyncSeriesWaterfallHook<[content: string, info: TemplateInfo]>;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["For details on ",(0,t.jsx)(n.code,{children:"AsyncSeriesWaterfallHook"})," see the ",(0,t.jsx)(n.a,{href:"https://github.com/webpack/tapable#hookhookmap-interface",children:"hook interface"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["For details on hook parameters, see in the ",(0,t.jsx)(n.a,{href:"#option-postprocess",children:"postprocess"})," callback option."]}),"\n",(0,t.jsx)(n.h3,{id:"beforeemit",children:(0,t.jsx)(n.code,{children:"beforeEmit"})}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"AsyncSeriesWaterfallHook<[content: string, entry: CompileEntry]>;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["For details on ",(0,t.jsx)(n.code,{children:"AsyncSeriesWaterfallHook"})," see the ",(0,t.jsx)(n.a,{href:"https://github.com/webpack/tapable#hookhookmap-interface",children:"hook interface"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["For details on hook parameters, see in the ",(0,t.jsx)(n.a,{href:"#option-beforeEmit",children:"beforeEmit"})," callback option."]}),"\n",(0,t.jsx)(n.h3,{id:"afteremit",children:(0,t.jsx)(n.code,{children:"afterEmit"})}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"AsyncSeriesHook<[entries: CompileEntries]>;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["For details on ",(0,t.jsx)(n.code,{children:"AsyncSeriesHook"})," see the ",(0,t.jsx)(n.a,{href:"https://github.com/webpack/tapable#hookhookmap-interface",children:"hook interface"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["For details on hook parameters, see in the ",(0,t.jsx)(n.a,{href:"#option-afterEmit",children:"afterEmit"})," callback option."]}),"\n",(0,t.jsx)(n.h3,{id:"integrityhashes",children:(0,t.jsx)(n.code,{children:"integrityHashes"})}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"AsyncSeriesHook<{\n  // the map of the output asset filename to its integrity hash\n  hashes: Map<string, string>;\n}>;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Called after all assets have been processed and hashes have finite values and cannot be changed, at the ",(0,t.jsx)(n.code,{children:"afterEmit"})," stage.\nThis can be used to retrieve the integrity values for the asset files."]}),"\n",(0,t.jsxs)(n.p,{children:["For details on ",(0,t.jsx)(n.code,{children:"AsyncSeriesHook"})," see the ",(0,t.jsx)(n.a,{href:"https://github.com/webpack/tapable#hookhookmap-interface",children:"hook interface"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["Callback Parameter: ",(0,t.jsx)(n.code,{children:"hashes"})," is the map of the output asset filename to its integrity hash.\nThe map only contains JS and CSS assets that have a hash."]}),"\n",(0,t.jsx)(n.p,{children:"You can write your own plugin, for example, to extract integrity values into the separate file:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"const fs = require('fs');\nconst path = require('path');\nconst HtmlBundlerPlugin = require('html-bundler-webpack-plugin');\nmodule.exports = {\n  output: {\n    crossOriginLoading: 'anonymous', // required for Subresource Integrity\n  },\n  plugins: [\n    new HtmlBundlerPlugin({\n      entry: {\n        index: './src/index.html',\n      },\n      js: {\n        filename: '[name].[contenthash:8].js',\n        chunkFilename: '[name].[contenthash:8].chunk.js',\n      },\n      css: {\n        filename: '[name].[contenthash:8].css',\n        chunkFilename: '[name].[contenthash:8].chunk.css',\n      },\n      integrity: 'auto',\n    }),\n    // your plugin to extract the integrity values\n    {\n      apply(compiler) {\n        compiler.hooks.compilation.tap('MyPlugin', (compilation) => {\n          const hooks = HtmlBundlerPlugin.getHooks(compilation);\n          hooks.integrityHashes.tapAsync(\n            'MyPlugin',\n            (hashes) => Promise.resolve().then(() => {\n                if (hashes.size > 0) {\n                  const saveAs = path.join(__dirname, 'dist/integrity.json');\n                  const json = Object.fromEntries(hashes);\n                  fs.writeFileSync(saveAs, JSON.stringify(json, null, '  ')); // => save to file\n                  console.log(hashes); // => output to console\n                }\n              })\n            );\n          }\n        );\n      },\n    },\n  ],\n};\n"})}),"\n",(0,t.jsxs)(n.p,{children:["The content of the ",(0,t.jsx)(n.code,{children:"dist/integrity.json"})," file looks like:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:'{\n  "815.49b3d882.chunk.js": "sha384-dBK6nNrKKk2KjQLYmHZu6tuWwp7kBzzEvdX+4Ni11UzxO2VHvP4A22E/+mmeduul",\n  "main.9c043cce.js": "sha384-AbfLh7mk6gCp0nhkXlAnOIzaHeJSB8fcV1/wT/FWBHIDV7Blg9A0sukZ4nS3xjtR"\n  "main.dc4ea4af.chunk.css": "sha384-W/pO0vwqqWBj4lq8nfe+kjrP8Z78smCBttkCvx1SYKrVI4WEdJa6W6i0I2hoc1t7",\n  "style.47f4da55.css": "sha384-gaDmgJjLpipN1Jmuc98geFnDjVqWn1fixlG0Ab90qFyUIJ4ARXlKBsMGumxTSu7E",\n}\n'})})]})}function d(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(h,{...e})}):h(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>i,x:()=>l});var o=s(6540);const t={},r=o.createContext(t);function i(e){const n=o.useContext(r);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:i(e.components),o.createElement(r.Provider,{value:n},e.children)}}}]);