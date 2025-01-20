import(
  /* webpackChunkName: "module1" */
  './moduleA'
).then(
  () =>
    import(
      /* webpackChunkName: "module2.asyncChunk" */ // <= test: preload.filter.excludes: [/noPreload/, /asyncChunk/]
      './moduleB?q=1'
    )
);

import './moduleC';

console.log('>> lib.js');
