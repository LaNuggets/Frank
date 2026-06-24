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
    <div v-if="hasSlide" class="slide">
      <div v-html="currentSlide" class="currentslide"/>
      <span class="slide-number">{{ current + 1 }} / {{ slides.length }}</span>
    </div>
  </div>
</template>

<style scoped>
.presentation {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.slide {
  position: relative;
  width: 100%;
  height: 100%;
}
.currentslide{
  margin: 10px;
}
.slide-number {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 0.85rem;
  opacity: 0.6;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
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