<script setup lang="ts">
import { Menu, Submenu, MenuItem  } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ref } from 'vue';
import { openProject, saveProject, saveProjectAs , createProject,clearTmpFolder} from './ts/action_file.ts';
import { presentation_mode } from './ts/action_project.ts';
import Editor from './components/editor.vue';
import Author from './components/author.vue';
import Css from './components/css.vue';
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

</script>

<template>
  <div class="app-layout">

    <main class="main">
      <Project />
    </main>

    <aside v-if="activePanel" class="side-panel">
      <Editor v-if="activePanel === 'editor'" />
      <Author v-if="activePanel === 'author'" />
      <Css v-if="activePanel === 'css'" />
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

/* 🧱 ZONE PROJECT */
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