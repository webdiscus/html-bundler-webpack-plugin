const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizer = require('css-minimizer-webpack-plugin');

// the base configuration for a simple single page

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      minify: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|webp)$/,
        type: 'asset/resource',
        generator: {
          // save images to file
          filename: (info) => {
            const params = new URLSearchParams(info.module.resourceResolveData.query);
            const width = params.get('w');

            return width ? `img/[name]-w${width}[ext]` : `img/[name][ext]`;
          },
        },
      },
    ],
  },
  optimization: {
    // Note: defaults, the minimizer contains TerserPlugin to minify JS,
    // if you define the minimizer manuelLl, don't forget add '...' in the array
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
        },
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: 'webp',
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                // Please specify only one codec here, multiple codecs will not work
                webp: {
                  quality: 70,
                },
              },
            },
          },
        ],
      }),

      new CssMinimizer(),

      //new TerserPlugin(),

      // https://webpack.js.org/configuration/optimization/#optimizationminimizer
      '...', // equivalent to `new TerserPlugin()`
    ],
  },
};
