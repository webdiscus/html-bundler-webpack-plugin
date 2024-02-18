// override external variable defined in the `data` option with local value in render mode
import tmpl from './main.pug?render&b=987';

document.getElementById('root').innerHTML = tmpl;
console.log('>> main');
