// import Pug template as template function
import component from './component.pug';

// render template function into HTML
const html = component({
  // pass variables into template
  name: 'MyComponent',
});

export default html;
