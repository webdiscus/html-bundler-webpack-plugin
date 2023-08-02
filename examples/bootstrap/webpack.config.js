const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.resolve(__dirname, 'dist'),
  },

  devServer: {
    static: path.resolve(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      // Compiles all template files in the directory
      // and stores the generated HTML files in `dist/` with the same directory structure
      entry: './src/views/',
      js: {
        // output filename of compiled JavaScript
        filename: 'js/[name].[contenthash:8].js',
        // Adds JavaScript to the DOM by injecting a `<script>` tag
        //inline: true, // enable if you want to try it
      },
      css: {
        // output filename of extracted CSS
        filename: 'css/[name].[contenthash:8].css',
        // Adds CSS to the DOM by injecting a `<style>` tag
        //inline: true, // enable if you want to try it
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader',
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [autoprefixer],
              },
            },
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(ico|png|jp?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
