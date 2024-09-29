import tmpl from '../views/partials/people.twig?lang=en';

// Note: Twig does not support passing variables to the client-side template function.
const html = tmpl({
  people: ['Walter White', 'Jesse Pinkman'],
});

document.getElementById('content').innerHTML = html;

console.log('>> app');
