const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  resolve: {
    alias: {
      '@fonts': path.join(__dirname, '../../fixtures/fonts'),
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },
      css: {
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

      // fonts from 'font' directory
      {
        test: /[\\/]fonts[\\/].+(woff2?|ttf|otf|eot|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext][query]',
        },
      },

      // image files from 'images' directory
      {
        test: /[\\/]images[\\/].+(png|jpe?g|webp|ico|svg)$/i,
        oneOf: [
          // auto inline by image size < 1 KB
          {
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 1024,
              },
            },
            // image > 1 KB save to file
            generator: {
              filename: 'assets/img/[name].[hash:8][ext]',

              dataUrl: (source, { filename, module: { rawRequest } }) => {
                if (filename.includes('.svg')) {
                  let dataURI = source.toString();

                  // test: modify original source
                  dataURI = dataURI.replace('viewBox', `class="injected-attribute" viewBox`);

                  return `data:image/svg+xml,` + encodeURIComponent(Buffer.from(dataURI, 'utf-8').toString());
                }

                // binary resource
                const ext = path.extname(filename.split('?')[0]).slice(1);

                return `data:image/${ext};base64,` + source.toString('base64');
              },
            },
          },
        ],
      },
    ],
  },
};
