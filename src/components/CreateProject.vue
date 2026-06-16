<script setup lang="ts">
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../ts/store";
import { ref } from "vue";

const store = useStore();
const error = ref();
const createProject = async () => {
    try {
        // This function will create a tmp folder with the base architecure in the os tmp file.
        // Base architecure is :
        //  codeprez/
        //   ├── assets/
        //   ├── env/
        //   ├── config.json
        //   ├── presentation.md
        //   └── style.css
        // The function will return a string containing the complete path of the newly created tmp folder.
        const workspace = await invoke<string>("create_project");
        // The path is store in pinia for further use.
        store.setWorkspacePath(workspace);
    } catch (e) {
        // TODO handle error
        error.value = e;
        console.log(e);
    }
}
</script>

<template>
    <button @click="createProject">
        Create New project
    </button>
    <pre>{{ error }}</pre>
</template>