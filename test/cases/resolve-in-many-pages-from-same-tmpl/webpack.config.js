const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const render = (content, data) => {
  for (const key in data) {
    const search = new RegExp(`{{ *${key} *}}`, 'g');
    const value = data[key];

    content = content.replace(search, value);
  }

  return content;
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: 'auto', // test with the auto public path
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      //verbose: true,
      // test: same script and style file used in many pages generated from the same template file
      entry: {
        home: {
          import: 'src/template.html',
          data: {
            title: 'Home',
          },
        },
        // test: resolve the correct auto public path for assets used in diff route/pages generated from one template
        'news/sport': {
          import: 'src/template.html',
          data: {
            title: 'News / sport',
          },
        },
        contact: {
          import: 'src/template2.html',
          data: {
            title: 'Contact',
          },
        },
        about: {
          import: 'src/template2.html',
          data: {
            title: 'About',
          },
        },
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'styles/css/[name].[contenthash:8].css',
      },

      loaderOptions: {
        preprocessor: (content, { data }) => render(content, data),
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader'],
      },

      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            name: 'assets/img/[name]-[width]w.[ext]',
          },
        },
      },
    ],
  },
};
