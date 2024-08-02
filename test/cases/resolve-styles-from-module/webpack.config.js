const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@styles': path.join(__dirname, 'src/assets/styles/'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
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
        use: ['css-loader', 'sass-loader'], // works up to `sass-loader` v15.0.0

        // since `sass-loader` v16.0.0 must be used `options.sassOptions`
        // to enable correct generation the sourceMap (including sourcesContent)
        // use: [
        //   'css-loader',
        //   {
        //     loader: 'sass-loader',
        //     options: {
        //       // to generate valid sourceMap use:
        //       api: 'modern-compiler',
        //       sassOptions: {
        //         sourceMap: true,
        //         sourceMapIncludeSources: true,
        //       },
        //     },
        //   },
        // ],
      },
      // process images loaded in styles from node module
      {
        test: /\.(png|jpg|jpeg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
