require.ensure([], function ensured(require) {
  require('./2.js');
});

console.log('>> 1');
