const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@src': path.join(__dirname, 'src'),
      '@fonts': path.join(__dirname, '../../fixtures/fonts'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        'home/index': './src/views/index.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].chunk.js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },

      preload: [
        {
          test: /\.(js|ts)$/,
          // filter: {
          //   excludes: [/noPreload/, /asyncChunk/],
          // },
          // the same effect using the function
          filter: ({ sourceFiles: [sourceFile], outputFile }) => {
            //console.log(' >> FILTER: ', { sourceFile, outputFile });
            return !/noPreload|asyncChunk/.test(outputFile);
          },
          as: 'script',
        },
        {
          test: /\.(s?css|less)$/,
          as: 'style',
          // filter: {
          //   excludes: [/moduleB/],
          // },
          // the same effect using the function
          filter: ({ sourceFiles, outputFile }) => {
            //console.log(' >> FILTER: ', { sourceFiles, outputFile });
            return !sourceFiles.some((sourceFile) => /moduleB/.test(sourceFile));
          },
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          as: 'font',
        },
      ],
      // verbose: true,
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
        test: /\.(ico|png|jpe?g|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
};
