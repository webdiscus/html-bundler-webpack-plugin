const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // test: rebuild all main templates after changes a partial (in deps/ directory)
        index: './src/index.pug',
        index2: './src/index2.pug',
      },
      preprocessor: 'pug',
      preprocessorOptions: {
        embedFilters: {
          // :escape
          escape: true,
          // :code
          code: {
            className: 'language-',
          },
          // :highlight
          highlight: {
            verbose: true,
            use: 'prismjs', // name of highlighting npm package, must be installed
          },
          // :markdown
          markdown: {
            highlight: {
              //use: 'prismjs', // name of highlighting npm package, must be installed
              use: {
                module: 'prismjs', // name of highlighting npm package, must be installed
                verbose: true,
              },
            },
          },
        },
      },

      // TODO: add the new syntax of the watchFiles option in pug-loader v3.x
      // test: watching for changes in specific files like *.c, *.md, etc
      watchFiles: {
        includes: [
          // add to watch all source samples from the `/deps` folder
          /\/deps\/.+$/,
          // add to watch styles included in pug
          /\.(s?css)$/i,
        ],
      },

      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(sc?ss|sass)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
