const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = [
  {
    name: 'config_1',
    mode: 'production',

    output: {
      path: path.join(__dirname, 'dist/output1'),
    },

    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          index: 'src/index.pug',
        },
        preprocessor: 'pug',
        preprocessorOptions: {
          // enable `:markdown` filter with additional options
          embedFilters: {
            markdown: {
              highlight: {
                use: null,
              },
            },
          },
        },
      }),
    ],
  },

  {
    name: 'config_2',
    mode: 'production',

    output: {
      path: path.join(__dirname, 'dist/output2'),
    },

    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          index: 'src/index.pug',
        },
        preprocessor: 'pug',
        preprocessorOptions: {
          // enable `:markdown` filter with additional options
          embedFilters: {
            markdown: {
              // TODO: change options in readme
              highlight: {
                use: {
                  module: 'prismjs',
                  options: {
                    verbose: true,
                  },
                },
              },
            },
          },
        },
      }),
    ],
  },
];
