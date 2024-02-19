import './style.css';

import componentA from './components/a';
import componentB from './components/b';

document.getElementById('root').innerHTML = componentA + componentB;

console.log('>> main');
