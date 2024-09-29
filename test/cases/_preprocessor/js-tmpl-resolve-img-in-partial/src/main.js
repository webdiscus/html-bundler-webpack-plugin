import tmpl from './images.html';

const html = tmpl({
  plumImage: require('@images/plum.png'),
});

document.getElementById('root').innerHTML = html;

console.log(html);
