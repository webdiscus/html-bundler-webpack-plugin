import tmpl from './app.hbs';

import homeIcon from '@images/icons/home.svg';
import imacIcon from '@images/icons/imac.svg';

const locals = {
  urlData: [
    //
    { href: './home.html', text: 'home', icon: homeIcon },
    { href: './imac.html', text: 'iMac', icon: imacIcon },
  ],
};

document.getElementById('app').innerHTML = tmpl(locals);

console.log('>> app');
