<template>
  <button>
    {{ text }}
  </button>
</template>

<script setup>
import { ref } from 'vue';

const text = ref('Button');
</script>

<!-- relative path to source style file -->
<style src="./MyButton.scss" lang="scss"></style>

<!-- local styles -->
<style>
button {
  color: tomato;
}
</style>
