<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "../ts/store";

const store = useStore();

/**
 * List of all rendered slides coming from global store
 */
const slides = computed<string[]>(() => store.renderedSlides as string[]);

/**
 * Index of the currently displayed slide
 */
const current = computed<number>(() => store.currentSlide as number);

/**
 * Check if there is a valid slide to display
 */
const hasSlide = computed(() =>
  slides.value.length > 0 && current.value < slides.value.length
);

/**
 * Safely get the current slide HTML content
 */
const currentSlide = computed(() =>
  slides.value[store.currentSlide] ?? ""
);
</script>

<template>
  <div class="presentation">
    <div v-if="hasSlide" class="slide">
      <div v-html="currentSlide" class="currentslide" />
      <span class="slide-number">
        {{ current + 1 }} / {{ slides.length }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* fullscreen presentation container */
.presentation {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

/* single slide wrapper */
.slide {
  position: relative;
  width: 100%;
  height: 100%;
}
.slide > div {
  height: 100%;
}

/* slide content spacing */
.currentslide {
  margin: 10px;
}

/* slide counter (bottom right) */
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

/* hide scrollbars for a clean presentation view */
.presentation {
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.presentation::-webkit-scrollbar {
  display: none;
}
</style>