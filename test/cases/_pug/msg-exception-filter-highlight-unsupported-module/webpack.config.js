const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  entry: {
    index: 'src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        embedFilters: {
          highlight: {
            //use: 'unsupported-module',
            use: {
              // the name of a using highlight npm module.
              module: 'unsupported-module',
              options: {
                // display in console warnings and loaded dependencies
                verbose: true,
              },
            },
          },
        },
      },
    }),
  ],
};
