const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      //pretty: true,
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
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
        test: /\.(png|jpg|jpeg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          // test case: when used min css and js directly in template,
          // then the `test` option must match exactly only js files from node_modules,
          // otherwise Webpack merge source JS together with source CSS in one file
          //test: /[\\/]node_modules[\\/]/, // Note: CSS will be not extracted!

          test: /[\\/]node_modules[\\/].+\.(js|ts)$/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
