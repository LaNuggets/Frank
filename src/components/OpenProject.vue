<script setup lang="ts">

import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { useStore } from '../ts/store'
import { ref } from "vue";

const workspaceStore = useStore();
const error = ref();

async function selectFile() {
    // This is the tauri plugin for file selection
    const file = await open({
        multiple: false,
        // Set filter to only search for .codeprez files
        filters: [
            {
                name: "CodePrez",
                extensions: ["codeprez"],
            },
        ],
    });

    if (!file) return;

    try {
        // This commande will unzip the .codeprez selected file to the os tmp folder (on linux /tmp/codeprez).
        // zipPath - This is the path of the selected archive to unzip.
        // This will return the workspace path wich is the os tmp folder (again, /tmp/codeprez on linux).
        workspaceStore.setWorkspacePath(await invoke<string>("unzip_command", {
            zipPath: file,
        }));
    } catch (e) {
        // TODO Handle error
        error.value = e;
        console.log(String(e));
    }
}
</script>

<template>
    <button @click="selectFile">
      Ouvrir un .codeprez
    </button>
    <pre>{{ error }}</pre>
</template>