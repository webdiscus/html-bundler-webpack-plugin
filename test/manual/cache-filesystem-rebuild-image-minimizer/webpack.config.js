const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const svgoConfig = {
  multipass: true,
  plugins: [
    'removeDimensions',
    {
      name: 'cleanupNumericValues',
      params: {
        floatPrecision: 3,
        leadingZero: true,
        defaultPx: true,
        convertToPx: true,
      },
    },
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeUnknownsAndDefaults: {
            unknownContent: true,
            unknownAttrs: true,
            defaultAttrs: true,
            uselessOverrides: true,
            keepDataAttrs: true,
            keepAriaAttrs: true,
            keepRoleAttr: true,
          },
          removeViewBox: false,
        },
      },
    },
  ],
};

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  output: {
    path: `${__dirname}/dist`,
    clean: true,
  },
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, '../../fixtures/images'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|webp|avif|svg|gif|ico)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
  ],
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        test: /\.(png|jpe?g|webp|avif|svg|gif|ico)$/i,
        deleteOriginalAssets: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.svgoMinify,
          options: {
            encodeOptions: svgoConfig,
          },
        },
      }),
    ],
  },

  // test cache filesystem: BUG in image-minimizer-webpack-plugin/dist/loader.js:154
  // See https://github.com/webdiscus/html-bundler-webpack-plugin/issues/130#issuecomment-2544123713
  cache: {
    type: 'filesystem',
    cacheDirectory: path.join(__dirname, '.cache'),
  },
};
