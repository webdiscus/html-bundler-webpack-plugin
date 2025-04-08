import HtmlBundlerPlugin from '@test/html-bundler-webpack-plugin';

export default {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/templates/home.html',
        about: './src/templates/about.html',
      },
      data: './src/data/data.mjs', // test changes in ESM file
      hotUpdate: true, // if JS files are not used, use it to enable live reload
      watchFiles: {
        includes: [/company.js/], // watch changes in the file imported in data.mjs
      },
      //verbose: true,
    }),
  ],

  devServer: {
    static: './dist',
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
