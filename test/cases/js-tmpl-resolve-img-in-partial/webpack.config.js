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
      loaderOptions: {
        sources: [
          {
            tag: 'img',
            filter: ({ tag, attribute, value, attributes, resourcePath }) => {
              //console.log('>> filter sources: ', { attribute, value });
              // disable parsing of value in compile mode if the value contains expression of the preprocessor, e.g., 'Eta'
              if (attribute === 'src' && value.includes('__eta.res')) {
                return false;
              }
            },
          },
        ],
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|svg|webp|jpe?g|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash:8][ext]',
        },
      },
    ],
  },
};
