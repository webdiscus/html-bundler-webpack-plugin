const fs = require('fs');
const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

/**
 * @param {CompileEntries} entries
 * @return {Array<{resource: string, assetFile: string | Array<string>}>}
 */
const manifest = (entries) => {
  // fix windows-like path
  const relPath = (file) => path.relative(__dirname, file).replace(/\\/g, '/');
  const assets = [];

  //console.dir({ entries }, { depth: 7 });

  for (let entry of entries) {
    assets.push({
      resource: relPath(entry.resource),
      assetFile: entry.assetFile,
    });

    for (let asset of entry.assets) {
      let assetItem;

      switch (asset.type) {
        case 'script':
          assetItem = {
            resource: relPath(asset.resource),
            assetFile: [],
          };

          let chunkFiles = [];
          asset.chunks.forEach((item) => {
            chunkFiles.push(item.chunkFile || item.assetFile);
          });
          if (chunkFiles.length === 1) {
            assetItem.assetFile = chunkFiles[0];
          } else {
            assetItem.assetFile = chunkFiles;
          }

          if (asset.integrity) assetItem.integrity = asset.integrity;

          break;
        case 'style':
          let resource = Array.isArray(asset.resource)
            ? asset.resource.map((file) => relPath(file))
            : relPath(asset.resource);

          assetItem = {
            resource,
            assetFile: asset.assetFile,
          };

          if (asset.integrity) assetItem.integrity = asset.integrity;

          break;
        case 'resource':
          assetItem = {
            resource: relPath(asset.resource),
            assetFile: asset.assetFile,
          };

          break;
      }

      assets.push(assetItem);
    }
  }

  //console.log(assets);

  return assets;
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    crossOriginLoading: 'anonymous',
  },

  resolve: {
    alias: {
      '@fixtures': path.resolve(__dirname, '../../fixtures'),
    },
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
      // test with integrity hash
      integrity: true,
      verbose: true,
    }),
    {
      apply(compiler) {
        const pluginName = 'myPlugin';
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // test sync hook - ok
          hooks.afterEmit.tap(pluginName, (entries, options) => {
            const saveAs = path.join(__dirname, 'dist/assets.json');
            const assets = manifest(entries);
            const data = JSON.stringify(assets, null, '  ');

            fs.writeFileSync(saveAs, data);
          });

          // test issue: the file is created but the content is saved after test is done
          // hooks.afterEmit.tapAsync(pluginName, (entries, options, cb) => {
          //   const saveAs = path.join(__dirname, 'dist/assets.json');
          //   const assets = manifest(entries);
          //   const data = JSON.stringify(assets, null, '  ');
          //
          //   fs.writeFile(saveAs, data, { flush: true }, cb);
          // });

          // test issue: the file is created but the content is saved (by promises.writeFile) after test is done
          // hooks.afterEmit.tapPromise(
          //   pluginName,
          //   (entries, options) =>
          //     new Promise((resolve, reject) => {
          //       const saveAs = path.join(__dirname, 'dist/assets.json');
          //       const assets = manifest(entries);
          //       const data = JSON.stringify(assets, null, '  ');
          //
          //       resolve(fs.promises.writeFile(saveAs, data, { flush: true }));
          //     })
          // );
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
