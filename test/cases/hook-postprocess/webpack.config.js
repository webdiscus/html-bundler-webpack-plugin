const fs = require('fs');
const path = require('path');
const HtmlBundlerPlugin = require('../../../');

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
    {
      apply(compiler) {
        const pluginName = 'myPlugin';
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);
          // test hook
          // TODO: add postprocess hook
          // hooks.postprocess.tap(pluginName, (content, { entry, assets, outputPath }) => {
          //   // test modify generated HTML
          //   content = content.replace('Hello World!', 'Hi Webpack!');
          //   console.dir({ _: '\n ### HOOK postprocess: ', entry, assets }, { depth: 5 }, content);
          //
          //   //console.log('\n ### HOOK: ');
          //   // if (hashes.size > 0) {
          //   //   const saveAs = path.join(__dirname, 'dist/integrity.json');
          //   //   const json = Object.fromEntries(hashes);
          //   //   fs.writeFileSync(saveAs, JSON.stringify(json, null, '  '));
          //   // }
          //
          //   return content;
          // });

          // test hook
          hooks.afterEmit.tapAsync(pluginName, (data) => {
            //console.log('\n ### HOOK afterEmit: ', data);
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
