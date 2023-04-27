module.exports = {
  devtool: false,

  output: {
    // clean the output directory before emit
    clean: true,

    //asyncChunks: false,
    //hashSalt: '1234567890',
    //pathinfo: false,
    //hashFunction: require('metrohash').MetroHash64,
    //asyncChunks: false,
  },

  plugins: [],

  module: {
    rules: [],
  },

  experiments: {
    //futureDefaults: true,
    // set behavior as in Webpack <= v5.82 to avoid/decries randomizing of hashing names
    topLevelAwait: false,
  },

  optimization: {
    //chunkIds: 'deterministic',
    //moduleIds: 'deterministic',
    //realContentHash: true,
  },
};

// TODO: some tests fail with parallelism = 1
//module.exports.parallelism = 1;
