const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: false,
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        contact: 'src/views/contact.html',
        index: 'src/views/home.html',
        about: 'src/views/about.html',
        sitemap: 'src/sitemap.html',
        app: 'app/index.html',
        404: '404.html',
      },
      js: {
        // output filename of extracted JS
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS
        filename: 'css/[name].[contenthash:8].css',
      },
      watchFiles: {
        paths: ['src'],
      },
      loaderOptions: {
        //cacheable: false,
        preprocessor: (template, { rootContext, data }) =>
          require('ejs').render(template, data, { root: path.join(rootContext, 'src/views') }),
      },
      //verbose: 'auto',
      //verbose: true,
      //verbose: false,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /[\\/]images[\\/].*(ico|gif|png|jpe?g|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[contenthash:8][ext]',
        },
      },
    ],
  },
};
