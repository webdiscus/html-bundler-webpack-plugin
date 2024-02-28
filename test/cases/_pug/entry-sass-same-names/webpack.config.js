const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // TODO: fix error for HTML
    //index: './src/views/index.html',
    index: './src/views/index.pug',
    main: './src/assets/main.scss', // with same name is required the style in template
    'page/about': './src/views/about/style.scss',
    'page/contact': './src/views/contact/style.scss',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      css: {
        // Note:
        //   - the [name] for a style in entry is the complete entry name, e.g.:
        //     for `'assets/css/about' : './src/views/about/style.scss'` the filename is `/somepath/assets/css/about.1234abcd.css`
        //   - the [name] for required file in pug is basename of the file, e.g.:
        //     for `require('../assets/main.scss')` the filename is `/somepath/main.1234abcd.css`
        //
        // !!! MEGA ULTRA IMPORTANT !!!
        // Always use any unique substitutions for required resource, e.g. [id] or [contenthash]
        // to avoid the error `Multiple chunks emit assets to the same filename`.
        // The error appear if more files matched here also will be matched from entry with same basename,
        // see above in entry.
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
