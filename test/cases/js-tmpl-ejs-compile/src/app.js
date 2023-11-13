import tmpl from './partials/content.html?lang=en'; // test: pass variable into partials via query

// render template function with variables
const html = tmpl({ name: 'World', people: ['Alexa <Amazon>', 'Cortana <MS>', 'Siri <Apple>'] });

document.getElementById('main').innerHTML = html;

console.log('>> app');
