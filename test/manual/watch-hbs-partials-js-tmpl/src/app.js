import tmpl from './app.hbs?lang=de';

const locals = {
  helloName: 'World',
  name: 'Max',
  age: 21,
  navText: 'Navigation',
};

document.getElementById('app').innerHTML = tmpl(locals);

console.log('>> app');
