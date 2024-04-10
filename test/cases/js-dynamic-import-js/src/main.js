import log from './log';
import(/* webpackChunkName: "deferred" */ './deferred').then((module) => module.default());

// OK
//import(/* webpackChunkName: "prefetched" */ './prefetched').then((module) => module.default());

// test bugfix: if css.inline=true then occurs the error
import(/* webpackChunkName: "prefetched", webpackPrefetch: true */ './prefetched').then((module) => module.default());

// OK
import(/* webpackChunkName: "prefetched-delayed", webpackPrefetch: true */ './prefetched-delayed').then(
  ({ default: run }) => {
    setTimeout(() => {
      run();
    }, 2000);
  }
);

log('>> main');
