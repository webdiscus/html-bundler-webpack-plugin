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

<!-- test: extract global style -->
<style>
button {
  border: 2px solid grey;
}
</style>

<!-- test: extract local style -->
<style scoped>
button {
  border-radius: 20px;
}
</style>

<!-- test: extract module style, lang scss -->
<style module lang="scss">
$color: wheat;
button {
  background-color: $color;
}
</style>
