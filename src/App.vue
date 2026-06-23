<script setup lang="ts">
import { Menu, Submenu, MenuItem  } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { onMounted, ref } from 'vue';

const appWindow = getCurrentWindow();
const isMaximized = ref(false);
const editorOpen = ref(false);

function toggleEditor() {
  editorOpen.value = !editorOpen.value;
}

const startDrag = (e: MouseEvent) => {
  if (e.buttons === 1) appWindow.startDragging();
};

const CreateMenu = async () => {
  const FileMenu = await Submenu.new({
    text: 'Fichier',
    icon: 'Folder',
    items: [
      await MenuItem.new({
        id: 'quit',
        text: 'Fermer',
        action: () => {
          console.log('Quit pressed');
        },
      }),
      await MenuItem.new({
        id: 'open',
        text: 'Ouvrir',
        action: () => {
          console.log('Open pressed');
        },
        accelerator: 'CmdOrCtrl+O',
      }),
      await MenuItem.new({
        id: 'save',
        text: 'Enregistrer',
        action: () => {
          console.log('Save pressed');
        },
        accelerator: 'CmdOrCtrl+S',
      }),
      await MenuItem.new({
        id: 'presentation',
        text: 'Présentation',
        action: () => {
          console.log('presentation pressed');
        },
        accelerator: 'Alt+P',
      }),
    ],
  });
  const editmenu = await Submenu.new({
    text: 'Édition',
    items: [
      await MenuItem.new({
        id: 'toggleEditor',
        text: 'Afficher/Masquer l\'éditeur',
        action: toggleEditor,
        accelerator: 'Alt+M',
      }),
      await MenuItem.new({
        id: 'Config',
        text: 'Afficher/Masquer les Autheurs',
        action: () => {
          console.log('Authors pressed');
        },
        accelerator: 'Alt+A',
      }),
      await MenuItem.new({
        id: 'Css',
        text: 'Afficher/Masquer les css',
        action: () => {
          console.log('Css pressed');
        },
        accelerator: 'Alt+C',
      }),
      await MenuItem.new({
        id: 'newWindow',
        text: 'ajouter une feuille',
        action: () => {
          console.log('New Window pressed');
        },
        accelerator: 'Shift+Enter',
      }),
      await MenuItem.new({
        id: 'closeWindow',
        text: 'supprimer la feuille',
        action: () => {
          console.log('Close Window pressed');
        },
        accelerator: 'Shift+Backspace',
      }),
    ],
  });
  const menu = await Menu.new({
    items: [FileMenu, editmenu],
  });

  await menu.setAsAppMenu();
}

CreateMenu();
</script>

<template>
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from '@tauri-apps/api/window';

import SaveAs from "./components/SaveAs.vue";
import Save from "./components/Save.vue";

import OpenProject from "./components/OpenProject.vue";
import ReadFile from "./components/ReadFile.vue";
import Writefile from "./components/WriteFile.vue";
import Tree from "./components/Tree.vue";
import CreateProject from "./components/CreateProject.vue";
import ReadFileLines from "./components/ReadFileLines.vue";


// Quick reminder off how the app save is content.
// The logic is has follow; the user open a project, that's will create a tmp folder.
// This tmp folder is the active workspace. That's where evreything is modified at first.
// Then when the user gonna save is project with the 'zip_command',
// this will take the tmp folder content and zip it to the given path.

const workspace = ref<string | null>(null);


// This part is for clearing the tmp file when the close button is pressed.
// But we can not be sure that the app will close on this way.
// So on the rust side, the same function is call on app lunch.
const folder = ref();
onMounted(async () => {
    await getCurrentWindow().onCloseRequested(async () => {
        try {
            folder.value = await invoke<string[]>("clear_tmp_folder");
        } catch (e) {
            folder.value = e;
        }
    });
});


</script>

<template>
  <main class="container">
    <h1>Welcome to Frank</h1>
    <CreateProject />

    <SaveAs />
    <Save />

    <OpenProject />

    <ReadFile />
    <ReadFileLines />
    <Writefile />

    <Tree />
  </main>
</template>

<style scoped>
</style>