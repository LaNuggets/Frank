<script setup lang="ts">
import { Menu, Submenu, MenuItem  } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ref } from 'vue';
import { openProject, saveProject, saveProjectAs , createProject,clearTmpFolder} from './ts/action_file.ts';
import { newSlide, removeSlide, presentation_mode } from './ts/action_project.ts';

const appWindow = getCurrentWindow();
const editorOpen = ref(false);
const authorOpen = ref(false);
const cssOpen = ref(false);
function toggleEditor() {
  editorOpen.value = !editorOpen.value;
}

function toggleAuthor() {
  authorOpen.value = !authorOpen.value;
}

function toggleCss() {
  cssOpen.value = !cssOpen.value;
}

const startDrag = (e: MouseEvent) => {
  if (e.buttons === 1) appWindow.startDragging();
};

const CreateMenu = async () => {
  const FileMenu = await Submenu.new({
    text: 'Fichier',
    items: [
      await MenuItem.new({
        id: 'quit',
        text: 'Fermer',
        action: () => {
          clearTmpFolder();
          appWindow.close();
        },
      }),
      await MenuItem.new({
        id: 'new',
        text: 'Nouveau',
        action: () => {
          createProject();
        },
        accelerator: 'CmdOrCtrl+N',
      }),
      await MenuItem.new({
        id: 'open',
        text: 'Ouvrir',
        action: () => {
          openProject();
        },
        accelerator: 'CmdOrCtrl+O',
      }),
      await MenuItem.new({
        id: 'save',
        text: 'Enregistrer',
        action: () => {
          saveProject();
        },
        accelerator: 'CmdOrCtrl+S',
      }),
      await MenuItem.new({
        id: 'save as',
        text: 'Enregistrer sous',
        action: () => {
          saveProjectAs();
        },
        accelerator: 'CmdOrCtrl+Shift+S',
      }),
      await MenuItem.new({
        id: 'presentation',
        text: 'Présentation',
        action: () => {
          presentation_mode();
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
        action: toggleAuthor,
        accelerator: 'Alt+A',
      }),
      await MenuItem.new({
        id: 'Css',
        text: 'Afficher/Masquer les css',
        action: toggleCss,
        accelerator: 'Alt+C',
      }),
      await MenuItem.new({
        id: 'newSlide',
        text: 'ajouter une feuille',
        action: newSlide,
        accelerator: 'Shift+Enter',
      }),
      await MenuItem.new({
        id: 'removeSlide',
        text: 'supprimer la feuille',
        action: removeSlide,
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
</template>

<style scoped>
</style>