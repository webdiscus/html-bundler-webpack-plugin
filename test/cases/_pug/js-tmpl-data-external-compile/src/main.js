import tmpl from './main.pug';

document.getElementById('root').innerHTML = tmpl({
  b: 987, // override external variable defined in the `data` option with local value
});
console.log('>> main');
