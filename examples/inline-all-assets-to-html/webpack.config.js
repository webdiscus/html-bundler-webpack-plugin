const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, 'src/assets/images'),
      '@fonts': path.join(__dirname, 'src/assets/fonts'),
      '@scripts': path.join(__dirname, 'src/scripts'),
      '@styles': path.join(__dirname, 'src/styles'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },
      css: {
        inline: true, // inline CSS into HTML
      },
      js: {
        inline: true, // inline JS into HTML
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      // inline all assets: images, svg, fonts
      {
        test: /\.(png|jpe?g|webp|svg|woff2?)$/i,
        type: 'asset/inline',
      },
    ],
  },

  performance: false, // disable warning max size

  // enable live reload
  devServer: {
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
