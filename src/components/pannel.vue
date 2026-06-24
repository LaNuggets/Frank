<script setup lang="ts">
import { ref, watch } from "vue";
import { readFile, writeFile } from "../ts/action_file";
import { convertHTMLToCustom } from "../ts/action_project";

const props = defineProps<{
  path: string | null;
  mode?: "raw" | "custom";
}>();

const text = ref("");

watch(
  () => props.path,
  async (path) => {
    if (!path) {
      text.value = "";
      return;
    }

    const raw = await readFile(path);

    if (props.mode === "custom") {
      text.value = convertHTMLToCustom(raw);
    } else {
      text.value = raw;
    }
  },
  { immediate: true }
);

const updateFile = async () => {
  if (!props.path) return;

  await writeFile(props.path, text.value);
};
</script>

<template>
  <textarea v-model="text" @input="updateFile" class="editor" />
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  padding: 1rem;
  font-family: monospace;
  font-size: 14px;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  overflow-y: auto;
}
</style>