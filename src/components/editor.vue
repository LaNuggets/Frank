<script setup lang="ts">
    import { ref, watch } from "vue";
    import { useStore } from "../ts/store";
    import { readFile, writeFile } from "../ts/action_file";

    const store = useStore();
    const text = ref("");
    watch(
        () => store.presentationPath,
        async (path) => {
            if (!path) {
                text.value = "";
                return;
            }

            text.value = await readFile(path);
        },
        { immediate: true }
    );
    const updateFile = async () => {
        if (!store.presentationPath) return;

        await writeFile(store.presentationPath, text.value);
    };
</script>

<template>
    <textarea
        v-model="text"
        @input="updateFile"
        class="editor"
    />
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
  border-left: 1px solid #ccc;
  outline: none;
  resize: none;
  overflow-y: auto;
}
</style>