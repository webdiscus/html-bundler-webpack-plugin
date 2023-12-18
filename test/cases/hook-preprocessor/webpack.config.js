const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

// custom sync preprocessor function
const render = (template, search, replacement) => template.replace(search, replacement);

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
        index: {
          import: './src/index.html?lang=en',
          data: {
            title: 'Test',
          },
        },
      },

      js: {
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js',
      },

      css: {
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].chunk.css',
      },
    }),
    {
      apply(compiler) {
        const pluginName = 'myPlugin';
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // test hook
          hooks.preprocessor.tap(pluginName, (content, loaderContext) => {
            const search = '<!-- PLACEHOLDER_FAVICON -->';
            const replacement = ['<link href="@images/favicon.ico" rel="icon" />'];

            return render(content, search, replacement);
          });
        });
      },
    },
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
