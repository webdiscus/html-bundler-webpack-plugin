const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
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
            //use: 'prismjs',
            use: {
              // the name of a using highlight npm module.
              module: 'prismjs',
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
