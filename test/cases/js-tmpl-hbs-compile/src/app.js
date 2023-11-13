import tmpl from './partials/content.html?lang=en';

const locals = {
  name: 'World',
  people: ['Alexa <Amazon>', 'Cortana <MS>', 'Siri <Apple>'],
};

document.getElementById('main').innerHTML = tmpl(locals);

console.log('>> app');
