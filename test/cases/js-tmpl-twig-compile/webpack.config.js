const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@scripts': path.join(__dirname, 'src/scripts/'),
      '@views': path.join(__dirname, 'src/views/'),
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/views/pages/index.twig',
          data: {
            title: 'Home',
          },
        },
      },
      data: {
        headline: 'Breaking Bad',
      },
      preprocessor: 'twig',
      preprocessorOptions: {
        //autoescape: true,
        namespaces: {
          // alias used for include/extends is a relative or absolute path
          partials: 'src/views/partials/',
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
