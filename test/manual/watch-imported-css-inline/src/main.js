import './style.css';

import componentA from './components/a';
import componentB from './components/b';

import react from 'react';
import reactDom from 'react-dom';
import * as vue from 'vue';
import * as parse5 from 'parse5';
import * as markdown from 'markdown-it';

document.getElementById('root').innerHTML = componentA + componentB;
console.log('>> main');

// test: inline JS with big size
console.log('>> react: ', react);
console.log('>> reactDom: ', reactDom);
console.log('>> vue', vue);
console.log('>> parse5', parse5);
console.log('>> markdown', markdown);

//x(; // simulate Syntax Error in watch mode
