<template>
  <button>
    {{ text }}
  </button>
</template>

<script setup>
import { ref } from 'vue';

const text = ref('Button');
</script>

<!-- test: ignore double style loaders when using the lang attribute -->
<style src="./MyButton.scss" lang="scss"></style>
