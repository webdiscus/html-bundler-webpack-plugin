// test: import multiple partials in the same JS file
import headerTmpl from './partials/header.html?lang=en';
import footerTmpl from './partials/footer.html';

const locals = {
  name: 'World',
  people: ['Alexa <Amazon>', 'Cortana <MS>', 'Siri <Apple>'],
};

document.getElementById('header').innerHTML = headerTmpl(locals);
document.getElementById('footer').innerHTML = footerTmpl({ footer: 'my footer' });

console.log('>> app');
