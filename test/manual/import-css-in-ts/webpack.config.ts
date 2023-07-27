import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlBundlerPlugin from 'html-bundler-webpack-plugin';

module.exports = {
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  plugins: [
    // test types.d.ts in an IDE
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: 'src/index.html',
          filename: '[name].html',
          data: {
            title: 'Test',
            id: 123,
          },
        },
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
        inline: false,
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
        inline: 'auto',
      },
      // preprocessor: false,
      // preprocessor: (content, context) => null,
      // preprocessor: (content, context) => {
      //   return context.data ? content : null;
      // },
      preload: [
        {
          test: /\.(js|ts)$/,
          as: 'script',
        },
      ],
      loaderOptions: {
        preprocessor: 'eta',
        sources: [
          {
            filter: (opt) => opt.attribute !== 'x-img',
          },
        ],
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: 'eta',
        },
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  devServer: {
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
} as webpack.Configuration;
