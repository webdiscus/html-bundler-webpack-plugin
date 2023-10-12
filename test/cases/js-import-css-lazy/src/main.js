import cssFile from './style-dynamic.scss?lazy';

function lazyLoad(outputFilename) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = outputFilename;
  document.head.appendChild(style);
}

console.log('cssFile: ', { cssFile });
lazyLoad(cssFile);
// - OR -
//lazyLoad(require('./style-dynamic.scss?lazy'));
