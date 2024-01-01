const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),

    // original Webpack issue, w/o using any plugin
    // filename: (pathData) => {
    //   const { filename } = pathData;
    //   console.log('-- JS.filename: ', {
    //     filename, // => undefined
    //   });
    //
    //   return '[name].bundle.js';
    // },
  },

  entry: {
    main: './src/main.js',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        //filename: '[name].bundle.js',
        filename: (pathData) => {
          //const { filename } = pathData;
          // console.log('------- JS.filename: ', {
          //   filename, // => undefined when JS is defined directly in entry, not in HTML, it is a Webpack bug
          // });

          return '[name].bundle.js';
        },
      },
    }),
  ],
};
