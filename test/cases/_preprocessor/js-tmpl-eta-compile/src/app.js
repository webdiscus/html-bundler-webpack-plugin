import tmpl from './partials/content.html?lang=en';

const html = tmpl({
  title: 'My Title',
  name: 'World',
  people: ['Alexa <Amazon>', 'Cortana <MS>', 'Siri <Apple>'],
  nested: { name: 'Eta' },
});

document.getElementById('main').innerHTML = html;

console.log('>> app');
