import tmpl from './partials/content.hbs?lang=en';
import imgPear from '@images/pear.png';

const locals = {
  name: 'World',
  people: ['Alexa <Amazon>', 'Cortana <MS>', 'Siri <Apple>'],
  imgKiwi: require('@images/kiwi.png'), // resolve an asset using require
  imgPear, // resolve an asset using import
};

document.getElementById('main').innerHTML = tmpl(locals);

console.log('>> app');
