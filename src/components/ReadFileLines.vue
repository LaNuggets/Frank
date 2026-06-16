<script setup lang="ts">

import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

const fileLines = ref();

const readLines = async () => {
    // Replace this with actual value
    const filename = "./assets/code.js";
    const lines = "1-5";

    try {
        // This function take as args 
        // filename - The name of the file to read (e.g: "assets/file.ts", "./assets/code.js").
        // lines - A String containing the first and last line on format "x-x" (e.g: "4-12", "24-76").
        // The return value is a array of string. Each element is a line, there a store in order (arr[0] is the first readed line).
        // If there is an error the function will return a string saying whats failed.
        fileLines.value = await invoke<string[]>("read_file_lines_command", {
            filename,
            lines,
        });
        console.log(fileLines);
    } catch (e) {
        fileLines.value = e;
        console.error(e);
    }
};
</script>

<template>
    <button @click="readLines">
        Read lines
    </button>
    <p>{{ fileLines }}</p>
</template>