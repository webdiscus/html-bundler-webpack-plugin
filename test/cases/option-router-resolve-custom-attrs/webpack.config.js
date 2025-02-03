const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    //publicPath: 'auto', // tested: OK
    //publicPath: () => '/', // tested: OK
    //publicPath: () => 'http://localhost:8080/', // tested: OK
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
        page1: './src/views/pages/page1.html',
        'sub/page2': './src/views/pages/sub/page2.html',
        'sub/page3': './src/views/pages/sub/page3.html',
        'login/signup/index': './src/views/pages/login/signup/index.eta',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      sources: [
        {
          tag: 'a',
          attributes: ['href', 'data-link'],
        },
        {
          tag: 'button',
          attributes: ['href', 'data-hyperlink'],
        },
      ],
      router: {
        //enabled: true, // OK
        //enabled: false, // OK
        //test: /\.html$/, // OK
        //test: [/\.html$/, /\.eta$/], // OK

        rewriteIndex: false,
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
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
