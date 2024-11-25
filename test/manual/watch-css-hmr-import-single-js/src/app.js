import timer from './timer.js';

// import multiple styles in the single JS file => HMR works for all CSS files
import './timer.css';
import './style-a.css';
import './style-b.css';

timer('#timer');
