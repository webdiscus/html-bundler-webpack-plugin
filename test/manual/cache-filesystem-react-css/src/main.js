import React from 'react';
import ReactDom from 'react-dom/client';
import App from './app';

const root = ReactDom.createRoot(document.getElementById('root'));

const response = App();

root.render(
  <>
    <h2>REACT</h2>
  </>
);

console.log('>> main: ', { response });
