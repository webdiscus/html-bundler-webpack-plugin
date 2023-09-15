require.ensure([], function ensured(require) {
  require('./3.js');
});

console.log('>> 2');
