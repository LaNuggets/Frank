<script setup lang="ts">
import { Menu, Submenu, MenuItem  } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { onMounted, ref , onUnmounted} from 'vue';
import { openProject, saveProject, saveProjectAs , createProject,clearTmpFolder} from './ts/action_file.ts';
import { presentation_mode } from './ts/action_project.ts';
import Pannel from './components/pannel.vue';
import Project from './components/project.vue';
import {useStore} from './ts/store.ts';

const appWindow = getCurrentWindow();
const activePanel = ref<"editor" | "author" | "css" | null>(null);

function toggleEditor() {
  activePanel.value = activePanel.value === "editor" ? null : "editor";
}

function toggleAuthor() {
  activePanel.value = activePanel.value === "author" ? null : "author";
}

function toggleCss() {
  activePanel.value = activePanel.value === "css" ? null : "css";
}

function handleShortcuts(e:KeyboardEvent){
  //fichier part
  if ((e.ctrlKey ||e.metaKey) && e.key.toLowerCase()==="n"){
    e.preventDefault();
    createProject();
  }
  if ((e.ctrlKey ||e.metaKey) && e.key.toLowerCase()==="o"){
    e.preventDefault();
    openProject();
  }
  if ((e.ctrlKey ||e.metaKey) && e.key.toLowerCase()==="s"){
    e.preventDefault();
    saveProject();
  }
  if ((e.ctrlKey ||e.metaKey) && e.shiftKey && e.key.toLowerCase()==="s"){
    e.preventDefault();
    saveProjectAs();
  }
  if (e.altKey && e.key.toLowerCase()==="p"){
    e.preventDefault();
    activePanel.value = null;
    presentation_mode();
  }
  //edition part
  if (e.altKey && e.key.toLowerCase()==="m"){
    e.preventDefault();
    toggleEditor();
  }
  if (e.altKey && e.key.toLowerCase()==="a"){
    e.preventDefault();
    toggleAuthor();
  }
  if (e.altKey && e.key.toLowerCase()==="c"){
    e.preventDefault();
    toggleCss();
  }
}

const CreateMenu = async () => {
  const FileMenu = await Submenu.new({
    text: 'Fichier',
    items: [
      await MenuItem.new({
        id: 'quit',
        text: 'Fermer',
        action: () => {
          useStore().workspacePath = "";
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
          activePanel.value = null;
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
      })
    ],
  });
  const menu = await Menu.new({
    items: [FileMenu, editmenu],
  });

  await menu.setAsAppMenu();
}

CreateMenu();
onMounted(() => {
  window.addEventListener('keydown', handleShortcuts);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleShortcuts);
});
</script>

<template>
  <div class="app-layout">
    <main class="main">
      <Project />
    </main>

    <aside v-if="activePanel" class="side-panel">
      <Pannel v-if="activePanel === 'editor'" :path="useStore().presentationPath" mode="custom" />
      <Pannel v-if="activePanel === 'author'" :path="useStore().configPath" mode="raw" />
      <Pannel v-if="activePanel === 'css'" :path="useStore().stylePath" mode="raw"/>
    </aside>
  </div>
</template>

<style scoped>
.app-layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  overscroll-behavior: contain;
}

.side-panel {
  position: absolute;
  top: 0;
  right: 0;

  width: 50%;
  height: 100%;
  overflow-y: auto;

  backdrop-filter: blur(4px);
  border-left: 1px solid #444;

  display: flex;
  flex-direction: column;

  overscroll-behavior: contain;
}
</style>