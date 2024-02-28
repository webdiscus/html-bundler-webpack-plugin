const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          // pass external data into home page
          import: 'src/home.pug',
          data: {
            title: {
              // test: call the function in template
              create: (str) => `Home '${str}' title!`,
            },
            a: 'abc',
            b: 123,
          },
        },

        about: {
          import: 'src/about.pug',
          // pass external data into about page
          data: {
            title: {
              // test: call the function in template
              create: (str) => `About '${str}' title!`,
            },
            a: 'xyz',
            b: 987,
          },
        },
      },

      preprocessor: 'pug',
    }),
  ],
};
