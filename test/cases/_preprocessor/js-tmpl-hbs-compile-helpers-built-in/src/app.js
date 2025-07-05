import tmpl from './views/app.hbs';

const locals = {
  title: 'Demo',
  name: 'World',
};

document.getElementById('main').innerHTML = tmpl(locals);

console.log('>> app');
