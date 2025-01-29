const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

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
      preload: [
        {
          test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
          as: 'image',
        },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
    ],
  },

  optimization: {
    minimizer: [
      '...',
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: 'xs',
            filename: 'img/[name]-xs[ext]',
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              resize: {
                enabled: true,
                width: 340,
              },
            },
          },
          {
            preset: 'sm',
            filename: 'img/[name]-sm[ext]',
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              resize: {
                enabled: true,
                width: 540,
              },
            },
          },
          {
            preset: 'md',
            filename: 'img/[name]-md[ext]',
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              resize: {
                enabled: true,
                width: 960,
              },
            },
          },
        ],
      }),
    ],
  },
};
