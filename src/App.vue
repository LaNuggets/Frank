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
</template>

<style scoped>
</style>