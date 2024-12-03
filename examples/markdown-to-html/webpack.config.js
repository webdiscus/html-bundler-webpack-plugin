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
      // the aliases will be resolved in Markdown file
      // for example: ![Image](@images/picture.png)
      '@images': path.join(__dirname, 'src/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: [
        {
          import: 'src/views/index.hbs', // HTML template where are loaded CSS styles for markdown and highlighting
          filename: 'index.html', // output HTML file containing rendered Markdown
          data: {
            file: 'src/views/markdown/demo.md', // <= path to markdown file relative to the project directory
            title: 'Markdown', // HTML title, displayed in the browser tab
            markdownTheme: 'light', // theme to load markdown CSS in HTML
            highlightingTheme: 'prism', // theme to load highlighting CSS in HTML
          },
        },
        {
          import: 'src/views/index.hbs',
          filename: 'index-dark.html',
          data: {
            file: 'demo.md', // <= path to the markdown file relative to one of the paths specified in the `preprocessorOptions.views` option
            title: 'Markdown',
            markdownTheme: 'dark',
            highlightingTheme: 'prism-dark',
          },
        },
        {
          import: 'src/views/index.hbs',
          filename: 'code-light.html',
          data: {
            file: 'code.md',
            title: 'Highlighting code',
            markdownTheme: 'light',
            highlightingTheme: 'prism',
          },
        },
        {
          import: 'src/views/index.hbs',
          filename: 'code-dark.html',
          data: {
            file: 'code.md',
            title: 'Highlighting code',
            markdownTheme: 'dark',
            highlightingTheme: 'prism-dark',
          },
        },
      ],

      hotUpdate: true, //  use it only if you don't have a script file
      preprocessor: 'handlebars', // use one of the template engines that supports Markdown: `eta`, `ejs`, `handlebars`, `pug`
      preprocessorOptions: {
        views: [
          // path to the directory where *.md files will be searched
          path.join(__dirname, 'src/views/markdown/'),
        ],
      },
      watchFiles: {
        includes: /\.md/, // watch changes in *.md files, needed for live reload
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },

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
