const fs = require('fs');
const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    crossOriginLoading: 'anonymous', // required for test Subresource Integrity
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js',
      },

      css: {
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].chunk.css',
      },

      integrity: 'auto',
    }),
    {
      apply(compiler) {
        const pluginName = 'extract-integrity';

        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // test promise - OK
          hooks.integrityHashes.tapPromise(pluginName, (hashes) =>
            Promise.resolve().then(() => {
              if (hashes.size > 0) {
                const saveAs = path.join(__dirname, 'dist/integrity.json');
                const json = Object.fromEntries(hashes);

                fs.writeFileSync(saveAs, JSON.stringify(json, null, '  ')); // => save to file
                //console.log(hashes); // => output to console
              }
            })
          );

          // test async - OK
          // hooks.integrityHashes.tapAsync(pluginName, (hashes, callback) => {
          //   if (hashes.size > 0) {
          //     const saveAs = path.join(__dirname, 'dist/integrity.json');
          //     const json = Object.fromEntries(hashes);
          //
          //     fs.writeFileSync(saveAs, JSON.stringify(json, null, '  ')); // => save to file
          //     //console.log(hashes); // => output to console
          //
          //     // tapAsync requires call of the callback()
          //     callback();
          //   }
          // });

          // test sync - OK
          // hooks.integrityHashes.tap(pluginName, (hashes) => {
          //   if (hashes.size > 0) {
          //     const saveAs = path.join(__dirname, 'dist/integrity.json');
          //     const json = Object.fromEntries(hashes);
          //
          //     fs.writeFileSync(saveAs, JSON.stringify(json, null, '  ')); // => save to file
          //     //console.log(hashes); // => output to console
          //   }
          // });
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

  optimization: {
    // test split chunks for dynamic loaded modules OK
    splitChunks: {
      minSize: 100,
    },
  },
};
