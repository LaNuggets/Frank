<script setup lang="ts">
    import { ref, watch } from "vue";
    import { useStore } from "../ts/store";
    import { readFile, writeFile } from "../ts/action_file";

    const store = useStore();
    const text = ref("");
    watch(
        () => store.stylePath,
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
        if (!store.stylePath) return;

        await writeFile(store.stylePath, text.value);
    };
</script>

<template>
    <textarea
        v-model="text"
        @input="updateFile"
        class="css"
    />
</template>

<style scoped>
.css {
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