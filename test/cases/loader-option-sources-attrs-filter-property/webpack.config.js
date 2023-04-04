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
        index: './src/index.html',
      },
      loaderOptions: {
        sources: [
          // resolve one attribute only if other attribute has special value
          {
            tag: 'meta',
            attributes: ['content'],
            // TODO: resolve the `content` attribute when one of other attributes contains one of a value
            //  or try to resolve a relative path in the attribute
            // oneOf: {
            //   name: ['twitter:image'],
            //   property: ['og:image', 'og:video'],
            //   itemprop: ['image', 'screenshot'],
            // },
            filter: ({ attributes }) => {
              const attrName = 'property';
              const attrValues = ['og:image', 'og:video']; // allowed values
              if (attributes[attrName] && attrValues.indexOf(attributes[attrName]) < 0) {
                return false; // return false to disable processing
              }
              // return true or undefined to enable processing
            },
          },
        ],
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(mp4)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/video/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
