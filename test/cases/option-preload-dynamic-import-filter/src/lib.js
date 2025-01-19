import(
  /* webpackChunkName: "module1" */
  './module-a'
).then(
  () =>
    import(
      /* webpackChunkName: "module2.asyncChunk" */ // <= test: preload.filter.excludes: [/no\-preload/, /asyncChunk/]
      './module-b'
    )
);

import './module-c';

console.log('>> lib.js');
