import tmpl from './app.hbs';

const locals = {
  helloName: 'World',
  name: 'Max',
  age: 21,
  navText: 'Navigation',
};

document.getElementById('main').innerHTML = tmpl(locals);

console.log('>> app');
