import(
  /* webpackChunkName: "module1" */ // <= test: webpackChunkName magic comment
  /* webpackPreload: true */ // <= the magic comment does not affect on preload plugin feature and can be omitted
  './module-a'
).then(
  () =>
    import(
      /* webpackChunkName: "module2" */ // <= test: webpackChunkName magic comment
      /* webpackPreload: true */ // <= test: webpackPreload magic comment (does not affect)
      './module-b'
    )
);

import './module-c';

console.log('>> lib.js');
