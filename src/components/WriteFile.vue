<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../ts/store";

const store = useStore();
const content = ref();
const result = ref();

const changeContent = async () => {
    const workspace = store.workspacePath;
    const file = 'config.json';

    try {
        // This command write content in the given file in the tmp workspace.
        // path - A string containing the path to the file to write data in.
        // content - A string containing the content to add to the file (which means all the already present file content and the new content).
        // E.g: if the file config.json contain '{"duration": 20}' and the user change like that '{"duration": 20, "slides": 48}'
        // you need to put in the content arg '{"duration": 20, "slides": 48}'
        // This return void when everythings work, otherwise, return error string.
        result.value = await invoke<string>("write_file", {
            path: `${workspace}/${file}`,
            content: content.value,
        });
    } catch (e) {
        // TODO handle error
        result.value =  e;
        console.log(e);
    }
}
</script>

<template>
  <textarea v-model="content"></textarea>

  <button @click="changeContent">
    Save file
  </button>

  <pre>{{ content }}</pre>
  <pre>{{ result }}</pre>
</template>