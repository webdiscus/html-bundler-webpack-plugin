const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'production',
  mode: 'development', // test inline big JS file after fatal error
  devtool: 'eval-source-map', // 'inline-source-map'
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.pug',
      },
      js: {
        inline: true,
      },
      css: {
        inline: true,
      },
      preprocessor: 'pug',
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: false, // prevents styling bug when input "type=text" is removed
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        // removeAttributeQuotes: true
        // minifyCSS: true,
        minifyJS: true,
      },
    }),
  ],

  module: {
    rules: [
      // {
      //   test: /\.(css)$/,
      //   use: ['css-loader'],
      // },
      {
        test: /\.(s?css|sass)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(js|ts)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        options: {
          compact: true,
          presets: [['@babel/preset-env', { modules: false }], '@babel/preset-typescript'],
        },
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
