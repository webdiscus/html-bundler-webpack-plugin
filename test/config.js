import path from 'path';

const PATHS = {
  base: __dirname,
  testSource: path.join(__dirname, 'cases'),
  // relative path in the test directory to web root dir name, same as by a web server (e.g. nginx)
  webRoot: '/dist/',
  // relative path in the test directory to expect files for test
  expected: '/expected/',
  // relative path in the public directory
  output: '/assets/',
};

export { PATHS };
