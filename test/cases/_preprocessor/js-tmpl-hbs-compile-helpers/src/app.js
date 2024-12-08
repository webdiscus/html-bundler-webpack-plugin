import tmpl from './app.hbs';

const locals = {
  helloName: 'World',
};

document.getElementById('app').innerHTML = tmpl(locals);

console.log('>> app');
