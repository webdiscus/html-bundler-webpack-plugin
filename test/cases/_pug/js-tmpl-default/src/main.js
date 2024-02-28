// default mode is `compile`, compiles the template to the template function
import headerTmpl from './header.pug';
import mainTmpl from './main.pug';

document.getElementById('header').innerHTML = headerTmpl();

document.getElementById('main').innerHTML = mainTmpl({
  title: 'Test title',
  text: 'Hello World!',
});

console.log('>> main');
