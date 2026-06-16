<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

type FileNode = {
    name: string;
    path: string;
    is_dir: boolean;
    children?: FileNode[];
};

const tree = ref<FileNode | null>(null);
const loading = ref(false);

async function loadTree() {
    loading.value = true;

    try {
        // This command return the tmp workspace tree
        // The return value is a Json with the FileNode type
        tree.value = await invoke<FileNode>("get_workspace_tree");
    } catch (e) {
        // TODO handle error
        console.error("Error loading tree:", e);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
  <div class="file-tree">

    <button @click="loadTree" :disabled="loading">
        {{ loading ? "Chargement..." : "Afficher l’arborescence" }}
    </button>

    <p v-if="!tree && !loading">
        Clique sur le bouton pour charger le workspace
    </p>

    <pre> {{ tree }} </pre>
  </div>
</template>