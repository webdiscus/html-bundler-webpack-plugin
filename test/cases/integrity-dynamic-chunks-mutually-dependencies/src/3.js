require.ensure([], function ensured(require) {
  require('./1.js');
});

console.log('>> 3');
