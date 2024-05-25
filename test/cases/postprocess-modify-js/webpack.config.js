const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
        inline: true,
      },
      postprocess: (content, templateInfo, compilation) => {
        const { RawSource } = compilation.compiler.webpack.sources;

        // the filename of JS used in the HTML
        const jsFilename = 'main.js';

        // get compiled JS code
        let source = compilation.assets[jsFilename].source();

        // modify JS code
        source = source.replace(/\$[^\{]/g, 'dollars');

        // update compilation with new JS code before this code will be inlined into HTML
        compilation.updateAsset(jsFilename, new RawSource(source));
      },
    }),
  ],
};
