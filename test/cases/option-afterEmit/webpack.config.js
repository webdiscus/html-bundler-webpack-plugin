const fs = require('fs');
const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

/**
 * @param {CompileEntries} entries
 * @return {Array<{resource: string, assetFile: string | Array<string>}>}
 */
const manifest = (entries) => {
  const assets = [];

  //console.dir({ entries }, { depth: 7 });

  for (let entry of entries) {
    assets.push({
      resource: path.relative(__dirname, entry.resource),
      assetFile: entry.assetFile,
    });

    for (let asset of entry.assets) {
      switch (asset.type) {
        case 'script':
          let assetItem = {
            resource: path.relative(__dirname, asset.resource),
            assetFile: [],
          };
          assets.push(assetItem);
          let chunkFiles = [];
          asset.chunks.forEach((item) => {
            chunkFiles.push(item.chunkFile || item.assetFile);
          });
          if (chunkFiles.length === 1) {
            assetItem.assetFile = chunkFiles[0];
          } else {
            assetItem.assetFile = chunkFiles;
          }
          break;
        case 'style':
          assets.push({
            resource: path.relative(__dirname, asset.resource),
            assetFile: asset.assetFile,
          });
          break;
        case 'resource':
          // TODO: add an image to test
          break;
      }
    }
  }

  //console.log(assets);

  return assets;
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: 'assets/js/[name].bundle.js',
      },
      css: {
        filename: 'assets/css/[name].bundle.css',
      },
      // test sync callback
      afterEmit: (entries, options, compilation) => {
        const saveAs = path.join(__dirname, 'dist/assets.json');
        const assets = manifest(entries);

        fs.writeFileSync(saveAs, JSON.stringify(assets, null, '  '));
      },

      // test async callback
      // afterEmit: (entries) =>
      //   new Promise((resolve) => {
      //     const saveAs = path.join(__dirname, 'dist/assets.json');
      //     const assets = manifest(entries);
      //
      //     fs.writeFile(saveAs, JSON.stringify(assets, null, '  '), resolve);
      //   }),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
