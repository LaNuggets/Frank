<script setup lang="ts">
import { Menu, Submenu, MenuItem  } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { onMounted, ref , onUnmounted} from 'vue';
import { openProject, saveProject, saveProjectAs , createProject,clearTmpFolder} from './ts/action_file.ts';
import Presentation from './components/presentation.vue';
import Pannel from './components/pannel.vue';
import Project from './components/project.vue';
import {useStore} from './ts/store.ts';

const appWindow = getCurrentWindow();
const activePanel = ref<"editor" | "author" | "css" | "presentation" | null>(null);
const store = useStore();
function toggleEditor() {
  activePanel.value = activePanel.value === "editor" ? null : "editor";
}

function toggleAuthor() {
  activePanel.value = activePanel.value === "author" ? null : "author";
}

function toggleCss() {
  activePanel.value = activePanel.value === "css" ? null : "css";
}

async function togglePresentation() {
  activePanel.value = activePanel.value === "presentation" ? null : "presentation";
  if (activePanel.value === "presentation") store.currentSlide = 0 ;
  await appWindow.setFullscreen(activePanel.value === "presentation")
  await appWindow.setDecorations(activePanel.value !== "presentation")
}

function handleShortcuts(e:KeyboardEvent){
  if (activePanel.value !== "presentation") {
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
  }else{
    handlePresentationKeys(e);
    return;
  }
  if (e.altKey && e.key.toLowerCase()==="p"){
    e.preventDefault();
    togglePresentation();
  }
}
function handlePresentationKeys(e: KeyboardEvent) {
  if (activePanel.value !== "presentation") return;

  if (e.key === "ArrowRight" || e.key === "ArrowDown" ) {
    if (store.currentSlide < store.renderedSlides.length - 1) {
      store.currentSlide++;
    }
  }

  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    store.currentSlide = Math.max(0, store.currentSlide - 1);
  }

  if (e.altKey && e.key.toLowerCase() === "p") {
    togglePresentation();
  }
}
function handlePresentationClick(e: MouseEvent) {
  if (activePanel.value !== "presentation") return;
  if (e.button !== 0) return;
  const middle = window.innerWidth / 2;

  // moitié gauche
  if (e.clientX < middle) {
    store.currentSlide = Math.max(0, store.currentSlide - 1);
    return;
  }
  if (store.currentSlide < store.renderedSlides.length - 1) {
    store.currentSlide++;
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
          store.workspacePath = "";
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
          activePanel.value = null;
          openProject();
          store.presentationVersion=0
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
          togglePresentation();
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
  window.addEventListener("click", handlePresentationClick);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleShortcuts);
  window.removeEventListener("click", handlePresentationClick);
});
</script>

<template class="no-scrollbar">
  <div class="app-layout">
    <main class="main">
      <Project v-if="activePanel !== 'presentation'" />
      <Presentation v-else />
    </main>

    <aside v-if="activePanel && activePanel !== 'presentation'" class="side-panel">
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

.no-scrollbar,
.main,
.side-panel,
.presentation {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.no-scrollbar::-webkit-scrollbar,
.main::-webkit-scrollbar,
.side-panel::-webkit-scrollbar,
.presentation::-webkit-scrollbar {
  display: none;
}

body.no-scrollbar {
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

body.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>