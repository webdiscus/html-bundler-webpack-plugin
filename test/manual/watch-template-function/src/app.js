import tmpl from './partials/content.html';

const html = tmpl({
  name: 'World',
});

document.getElementById('main').innerHTML = html;

console.log('>> app');
