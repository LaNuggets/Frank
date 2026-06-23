<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../ts/store";

const store = useStore();
const content = ref("");

const getContent = async () => {
    const workspace = store.workspacePath;
    const file = 'config.json';

    try {
        // This command gonna read the given file content
        // path - The path to the file to read in the workspace (the tmp folder).
        // The function will return the entire file content in a string.
        // Return a error msg if failed.
        content.value = await invoke<string>("read_file", {
            fileName: file,
        });
    } catch (e: any) {
        // TODO handle error
        content.value = e;
        console.log(e);
    }
};
</script>

<template>
    <button @click="getContent">
      Open file
    </button>
  <pre>{{ content }}</pre>
</template>