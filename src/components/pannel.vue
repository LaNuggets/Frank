<script setup lang="ts">
import { ref, watch } from "vue";
import { readFile, writeFile } from "../ts/action_file";
import { convertHTMLToCustom } from "../ts/action_project";

/**
 * Props:
 * - path: file path to edit
 * - mode: defines how content should be displayed ("raw" or "custom")
 */
const props = defineProps<{
  path: string | null;
  mode?: "raw" | "custom";
}>();

// current text displayed in the editor
const text = ref("");

/**
 * Load file content whenever the path changes
 */
watch(
  () => props.path,
  async (path) => {
    if (!path) {
      text.value = "";
      return;
    }

    const raw = await readFile(path);

    // convert HTML back to custom syntax if needed
    text.value = props.mode === "custom"
      ? convertHTMLToCustom(raw)
      : raw;
  },
  { immediate: true }
);

/**
 * Save content back to file on user input
 */
const updateFile = async () => {
  if (!props.path) return;

  await writeFile(props.path, text.value);
};
</script>

<template>
  <textarea v-model="text" @input="updateFile" class="pannel" />
</template>

<style scoped>
/* main editor panel styling */
.pannel {
  width: 100%;
  height: 100%;
  padding: 1rem;
  font-family: monospace;
  font-size: 14px;

  border: none;
  outline: none;

  background: rgba(255, 255, 255, 0.8);

  resize: none;
  overflow-y: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* hide scrollbar (webkit browsers) */
.pannel::-webkit-scrollbar {
  display: none;
}
</style>