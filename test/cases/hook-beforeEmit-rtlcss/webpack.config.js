const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const rtlCss = require('rtlcss');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html?lang=en',
      },

      js: {
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js',
      },

      css: {
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].chunk.css',
      },
    }),

    // The example of the plugin to create a second css bundle, processed by rtlcss.
    {
      apply(compiler) {
        const pluginName = 'myPlugin';
        const { RawSource } = compiler.webpack.sources;

        // the Webpack hook
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // the Bundler Plugin hook
          hooks.beforeEmit.tap(pluginName, (content, entry) => {
            // explain the structure of the `entry` object
            //console.dir({ hook: 'beforeEmit', entry }, { depth: 5 });

            entry.assets.forEach((asset) => {
              const { type, assetFile, inline } = asset;

              if (type !== 'style') return;

              let cssSource = compilation.assets[assetFile].source();
              let rtlResult = rtlCss.process(cssSource);
              let rtlAssetFile = assetFile.replace('.css', '.rtl.css');

              if (!inline) {
                // add new CSS file into compilation
                compilation.assets[rtlAssetFile] = new RawSource(rtlResult);

                // find inject pos: after the last <link> tag
                // TODO: implement your logic to find an inject pos
                let pos = content.lastIndexOf('<link');
                if (pos > -1) {
                  let injectPos = content.indexOf('>', pos);
                  // inject the style tag with rtl CSS into HTML
                  if (injectPos > -1) {
                    injectPos++;
                    content =
                      content.slice(0, injectPos) +
                      `<link href="${rtlAssetFile}" rel="stylesheet" />` +
                      content.slice(injectPos);
                  }
                }
              } else {
                // TODO: if CSS asset is inlined inject the <style> tag into HTML
              }
            });

            return content;
          });
        });
      },
    },
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
