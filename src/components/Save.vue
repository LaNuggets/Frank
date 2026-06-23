<script setup lang="ts">
import { invoke } from "@tauri-apps/api/core";
import { useStore } from '../ts/store';
import { ref } from "vue";

const store = useStore();
const error = ref();

const save = async () => {
    const zipPath = store.savePath;
    try {
        // This command gonna zip the tmp folder content at the given location.
        // zipPath - This is the location of where to save the project the extention .codeprez is set automatically.
        // filesName - This is all the files and folders to zip. The architecure is always the same at the root :
        //   ├── assets/
        //   ├── env/
        //   ├── config.json
        //   ├── presentation.md
        //   └── style.css
        // assets and env folders can contain other files and folders with no problemes.
        // The function return void when everythings is okay, otherwise; return error msg
        error.value = await invoke<string>("zip_command", {
            zipPath,
            filesName: [
                "assets",
                "env",
                "config.json",
                "presentation.md",
                "style.css",
            ],
        });

    } catch (e) {
        error.value = e;
        console.log(String(e));
    }
};
</script>

<template>
    <button @click="save">
        Save project
    </button>
  <pre>{{ error }}</pre>
</template>