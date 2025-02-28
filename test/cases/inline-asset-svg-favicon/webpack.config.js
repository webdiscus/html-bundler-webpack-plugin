const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      svg: {
        inline: {
          // test: all svg files will be inlined into DOM as <svg> tag, except:
          // - <link href="" rel="icon"> tag
          // - images with the `?inline` query
          embed: true,
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|svg)$/,
        type: 'asset/inline',
      },
    ],
  },
};
