import { createApp, ref } from 'vue';
import MyButton from './MyButton.vue';
// you can import styles here or directly in HTML
import './styles.scss';

createApp({
  setup() {
    return {
      title: ref('Hello Vue!'),
    };
  },
})
  .component('my-button', MyButton)
  .mount('#app');

console.log('>> Vue bundle with embedded assets.');
