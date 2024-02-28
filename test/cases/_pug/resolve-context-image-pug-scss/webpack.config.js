const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const srcPath = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'production',
  devtool: false,

  // test: usage of context with relative aliases
  context: srcPath,
  resolve: {
    alias: {
      // test: usage relative by context path
      Images: '/assets/images/',
      Styles: '/assets/styles/',
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: path.join(srcPath, 'views/index.pug'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        // TODO: fix - if the context is defined and basedir is undefined, then set basedir from context
        basedir: srcPath,
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
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
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[contenthash:8][ext]',
        },
      },
    ],
  },
};
