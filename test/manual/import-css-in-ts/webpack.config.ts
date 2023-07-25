import * as path from 'path';
import * as webpack from 'webpack';

// @ts-ignore
import * as HtmlBundlerPlugin from 'html-bundler-webpack-plugin';

module.exports = {
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/index.html',
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
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  devServer: {
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
} as webpack.Configuration;
