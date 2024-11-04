const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const contextDir = path.resolve(__dirname, 'context-dir');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      README_FILE: path.join(contextDir, 'readme.md'),
      '@styles': path.join(__dirname, 'src/styles'),
      '@images': path.join(__dirname, 'src/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.pug',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      preprocessor: 'pug',
      preprocessorOptions: {
        // enable filters used in pug
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
            github: true, // support github syntax for note, warning
            highlight: {
              verbose: true,
              use: 'prismjs', // name of highlighting npm package, must be installed
            },
          },
        },
      },
      loaderOptions: {
        context: contextDir, // resolve assets relative this directory
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
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
