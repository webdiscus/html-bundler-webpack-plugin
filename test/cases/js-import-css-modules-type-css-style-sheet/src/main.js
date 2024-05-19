import sheet from './style.css'; // using the `css-loader` option `exportType: 'css-style-sheet'`
//import sheet from './style.css' assert { type: 'css' }; // using the `css-loader` option `exportType: 'css-style-sheet'`

console.log('sheet: ', sheet);

document.adoptedStyleSheets = [sheet];
//shadowRoot.adoptedStyleSheets = [sheet]; // error in browser: shadowRoot is not defined