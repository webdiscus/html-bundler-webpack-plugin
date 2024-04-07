// dynamic import
import('./style.css');

// dynamic import
import('./component-a.js');

// normal import
import './component-b.js';

// dynamic import
import('./component-c.js').then(() => {
  console.log('>> after load component-c');
});

console.log('>> main');
