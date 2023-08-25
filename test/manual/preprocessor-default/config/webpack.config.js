const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    // note: when webpack config is loaded from subdirectory, must be used process.cwd() instead of __dirname
    path: path.join(process.cwd(), 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|ejs|eta)$/,
      entry: {
        index: {
          import: './src/views/home.eta',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // enable live reload
  devServer: {
    static: {
      directory: path.join(process.cwd(), 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
