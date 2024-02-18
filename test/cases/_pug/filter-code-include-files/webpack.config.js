const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        embedFilters: {
          // :escape
          escape: true,
          // :code
          code: {
            className: 'language-',
          },
          // :highlight
          highlight: {
            verbose: true,
            use: 'prismjs', // name of highlighting npm package, must be installed
          },
          // :markdown
          markdown: {
            highlight: {
              verbose: true,
              use: 'prismjs', // name of highlighting npm package, must be installed
            },
          },
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(sc?ss|sass)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
