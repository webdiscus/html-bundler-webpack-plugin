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
              // use css classname prefix for highlighting
              langPrefix: 'lang-',
              // don't use github syntax styles
              github: false,
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
              // use css classname prefix for highlighting
              langPrefix: 'language-',
              // enable highlighting in markdown
              highlight: {
                verbose: true,
                use: 'prismjs',
              },
              // use github syntax styles
              github: true,
            },
          },
        },
      }),
    ],
  },
];
