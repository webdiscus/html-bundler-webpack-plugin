// test import style file, including the query;
// the style tag should be injected in HTML

import './home.css?v=123';
import './vendor.css';

const sum = (a, b) => a + b;

console.log('>> home', sum(3, 5));
