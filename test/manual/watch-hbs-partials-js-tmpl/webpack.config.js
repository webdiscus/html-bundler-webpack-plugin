import HtmlBundlerPlugin from '@test/html-bundler-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

// Since we're using ES modules, we need to get __dirname differently
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, 'src/img'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.hbs',
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        strict: true,
        partials: ['src/partials'],
      },
      // data: {
      //   projectName: 'Test',
      // },
      // IMPORTANT: ESM data file must have '.mjs' file extension
      data: './src/data/index.mjs',
      watchFiles: {
        includes: [/\/data\/.+\.(m?js|json)$/],
      },
      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(ico|png|jpe?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },

  // enable live reload
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
