const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler',
    },
    extensions: ['.ts', '...'],
  },

  plugins: [
    new VueLoaderPlugin(),
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        // output JS filename, used only if the `inline` option is false
        filename: '[name].[contenthash:8].js',
        inline: true, // inline JS into HTML
      },
      css: {
        // output CSS filename, used only if the `inline` option is false
        filename: '[name].[contenthash:8].css',
        inline: true, // inline CSS into HTML
      },
      minify: 'auto', // minify html in production mode only
    }),
  ],

  module: {
    rules: [
      {
        test: /\.vue$/i,
        use: ['vue-loader'],
      },
      {
        test: /\.(css|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jpe?g|svg)$/,
        type: 'asset/inline', // inline all images into HTML/CSS
      },
    ],
  },

  // enable live reload
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
