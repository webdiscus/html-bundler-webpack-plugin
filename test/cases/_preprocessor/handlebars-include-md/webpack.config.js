const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: [
        {
          import: './src/index.hbs',
          filename: 'demo.html',
          data: {
            title: 'Demo',
            markdownFile: 'demo.md', // file relative to directory defined in `preprocessorOptions.views` option
          },
        },
        {
          import: './src/index.hbs',
          filename: 'code.html',
          data: {
            title: 'Code',
            markdownFile: path.join(__dirname, 'src/markdown/code.md'), // absolute file
          },
        },
      ],
      preprocessor: 'handlebars',
      preprocessorOptions: {
        views: [
          // path to the directory where *.md files will be searched
          path.join(__dirname, 'src/markdown/'),
        ],
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
