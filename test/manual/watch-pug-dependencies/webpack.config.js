const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
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
            github: true, // test: rendering markdown template with GitHub styles
            highlight: {
              verbose: true,
              use: 'prismjs', // name of highlighting npm package, must be installed
            },
          },
        },
      },

      // TODO: add the new syntax of the watchFiles option in pug-loader v3.x
      // test: watching for changes in specific files like *.c, *.md, etc
      watchFiles: {
        files: [
          // add to watch all source samples from the `/deps` folder
          /\/deps\/.+$/,
          // add to watch styles included in pug
          /\.(s?css)$/i,
        ],
      },
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
