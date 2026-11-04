import { greet } from './shared.js';

console.log(greet('main'));

import(/* webpackChunkName: "lazy" */ './lazy.js').then(({ default: message }) => {
  console.log(message);
});
