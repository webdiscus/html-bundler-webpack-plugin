const path = require('path');
const glob = require('glob');
//const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const HtmlBundlerPlugin = require('../../');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      // path to templates
      entry: 'src/views/',
      js: {
        // output filename of compiled JavaScript
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS
        filename: 'css/[name].[contenthash:8].css',
      },
      preprocessor: 'eta',
      preprocessorOptions: {
        views: path.join(__dirname, 'src/views/'),
      },
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(path.join(__dirname, 'src/views/**/*.+(html|eta)'), { nodir: true }),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
