// test import style file, including the query;
// the style tag should be injected in HTML

import './nested1.css?v=123';
import './nested1a.css';
import './nested1b.css';

import './main2'; // test the nested importing of a style

console.log('>> main');
