<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "../ts/store";

const store = useStore();

const slides = computed<string[]>(() => store.renderedSlides as string[]);
const current = computed<number>(() => store.currentSlide as number);
const hasSlide = computed(() =>
  slides.value.length > 0 && current.value < slides.value.length
);

const currentSlide = computed(() =>
  slides.value[store.currentSlide] ?? ""
);

</script>

<template>
  <div class="presentation">
    <div v-if="hasSlide" class="slide" v-html="currentSlide" />
  </div>
</template>

<style scoped>
.presentation {
  position: fixed;
  inset: 0;
  overflow: hidden;
  margin: 10px;
}

.slide {
  width: 100%;
  height: 100%;
}
.presentation {
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.presentation::-webkit-scrollbar {
  display: none;
}
</style>