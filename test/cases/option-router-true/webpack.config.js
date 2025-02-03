const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@scripts': path.join(__dirname, 'src/assets/scripts'),
      '@styles': path.join(__dirname, 'src/assets/styles'),
      '@views': path.join(__dirname, 'src/views/pages'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/pages/home/index.html',
        'login/signup/index': './src/views/pages/login/signup/index.eta',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      // test: if router option is specified and not disabled, then add default sources options:
      // sources: [
      //   {
      //     tag: 'a',
      //     //attributes: ['href'],
      //     //attributes: ['data-link'],
      //   },
      // ],

      router: true,
      // router: {
      //   enabled: true, // tested: OK
      // },
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
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
