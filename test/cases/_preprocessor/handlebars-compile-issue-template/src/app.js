import tmpl from './partials/content.hbs';

const locals = {
  name: 'World',
};

document.getElementById('app').innerHTML = tmpl(locals);
