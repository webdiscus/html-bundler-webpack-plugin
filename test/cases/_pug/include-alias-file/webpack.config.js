const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      ALIAS_CONTEXT_DIR: '/src/includes/',
      ALIAS_CONTEXT_FILE: '/src/includes/text.txt',
      ALIAS_FILE: path.resolve(__dirname, 'src/includes/text.txt'),
      //ALIAS_EXTERNAL_FILE: path.resolve(__dirname, '../../fixtures/text.txt'), // path relative test/cases/
      ALIAS_EXTERNAL_FILE: path.resolve(__dirname, '../../../fixtures/text.txt'), // path relative test/cases/_pug-loader
      ALIAS_SCRIPT_MAIN: path.resolve(__dirname, 'src/scripts/main.js'),
      ALIAS_SCRIPT_VENDOR: path.resolve(__dirname, 'src/scripts/vendor.js'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: 'src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      //pretty: true,
      js: {
        filename: 'assets/[name].js',
      },
      preprocessor: 'pug',
      preprocessorOptions: {
        // TODO: add to docs
        // BRAKING CHANGE in pug-plugin 4 -> 5:
        // v4: default root was project dir
        // v5: default root is false, because assets with root path is referenced in public directory
        root: path.join(__dirname), // test: root path used in the aliases

        embedFilters: {
          // :escape
          escape: true,
          // :code
          code: {
            className: 'lang',
          },
        },
      },
    }),
  ],
};
