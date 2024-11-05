const webpack = require('webpack');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

webpack([
  {
    name: 'config1',
    plugins: [new HtmlBundlerPlugin()],
    cache: {
      type: 'filesystem',
    },
  },
  {
    name: 'config2',
    plugins: [new HtmlBundlerPlugin()],
    cache: {
      type: 'filesystem',
    },
  },
]);
