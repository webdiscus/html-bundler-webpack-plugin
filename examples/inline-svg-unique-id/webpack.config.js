const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

// the modified original svgo plugin `prefixIds` to generate unique IDs
const svgoPluginUniqueIds = require('./svgo-plugins/uniqueIds');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset', // <= important to inline SVG into HTML
        loader: 'svgo-loader',
        options: {
          plugins: [
            {
              name: svgoPluginUniqueIds.name,
              fn: svgoPluginUniqueIds.fn,
              params: {
                // disable prefix as filename
                prefix: false,
                // enable unique ID for multiple inlining of the same SVG file containing IDs
                uniqueId: true,
              },
            },
          ],
        },
      },
    ],
  },
};
