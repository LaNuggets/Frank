<script setup lang="ts">
import { Menu, Submenu, MenuItem } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { onMounted, ref, onUnmounted } from 'vue';

import {
  openProject,
  saveProject,
  saveProjectAs,
  createProject,
  clearTmpFolder
} from './ts/action_file.ts';

import Presentation from './components/presentation.vue';
import Pannel from './components/pannel.vue';
import Project from './components/project.vue';
import { useStore } from './ts/store.ts';

const appWindow = getCurrentWindow();
const store = useStore();

/*
  Active UI panel state.

  null = nothing open
  "editor" / "author" / "css" = side panels
  "presentation" = fullscreen slideshow mode
*/
const activePanel = ref<string | null>(null);

/*
  Simple "jump to slide" system.

  Activated with AltGr.
  User types a number, then presses Enter.
*/
let jumpMode = false;
let jumpBuffer = "";

/*
  Small helper to toggle a panel on/off.

  If you click the same panel twice, it closes.
*/
const toggle = (panel: string | null) => {
  activePanel.value = activePanel.value === panel ? null : panel;
};

/*
  Enter / exit presentation mode.

  This also handles fullscreen + window chrome removal.
*/
const togglePresentation = async () => {
  activePanel.value =
    activePanel.value === "presentation" ? null : "presentation";

  // reset slide when entering presentation
  if (activePanel.value === "presentation") {
    store.currentSlide = 0;
  }

  // fullscreen mode feels better for slides
  await appWindow.setFullscreen(activePanel.value === "presentation");
  await appWindow.setDecorations(activePanel.value !== "presentation");
};

/*
  Global keyboard shortcuts (outside presentation mode).

  This is basically the "editor layer".
*/
const handleShortcuts = (e: KeyboardEvent) => {

  // If we are not in presentation mode → normal app shortcuts
  if (activePanel.value !== "presentation") {

    // file operations
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
      e.preventDefault();
      createProject();
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
      e.preventDefault();
      openProject();
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveProject();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveProjectAs();
    }

    // quick panel toggles
    if (e.altKey && e.key.toLowerCase() === "m") toggle("editor");
    if (e.altKey && e.key.toLowerCase() === "a") toggle("author");
    if (e.altKey && e.key.toLowerCase() === "c") toggle("css");

  } else {
    // everything presentation-related is handled here
    handlePresentationKeys(e);
    return;
  }

  // global shortcut: toggle presentation anytime
  if (e.altKey && e.key.toLowerCase() === "p") {
    e.preventDefault();
    togglePresentation();
  }
};

/*
  Presentation keyboard logic.

  This is where slide navigation happens.
*/
const handlePresentationKeys = (e: KeyboardEvent) => {

  if (activePanel.value !== "presentation") return;

  const maxIndex = store.renderedSlides.length - 1;

  /*
    Normal navigation mode (no jump active)
  */
  if (!jumpMode) {

    // next slide
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      store.currentSlide = Math.min(maxIndex, store.currentSlide + 1);
      return;
    }

    // previous slide
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      store.currentSlide = Math.max(0, store.currentSlide - 1);
      return;
    }
  }

  /*
    Enter jump mode (AltGr pressed)
  */
  if (e.key === "AltGraph") {
    jumpMode = true;
    jumpBuffer = "";
    return;
  }

  /*
    While in jump mode:
    - collect digits
    - Enter confirms jump
    - Escape cancels
  */
  if (jumpMode) {

    // build slide number (e.g. "1", "12", "20")
    if (/^[0-9]$/.test(e.key)) {
      jumpBuffer += e.key;
      return;
    }

    // confirm jump
    if (e.key === "Enter") {
      const target = parseInt(jumpBuffer, 10);

      if (!isNaN(target)) {
        store.currentSlide = Math.max(
          0,
          Math.min(maxIndex, target - 1)
        );
      }

      // reset state after jump
      jumpMode = false;
      jumpBuffer = "";
      return;
    }

    // cancel jump mode
    if (e.key === "Escape") {
      jumpMode = false;
      jumpBuffer = "";
      return;
    }

    return;
  }

  /*
    Exit presentation quickly
  */
  if (e.altKey && e.key.toLowerCase() === "p") {
    togglePresentation();
    return;
  }
};

/*
  Click navigation inside presentation:

  left half  → previous slide
  right half → next slide
*/
const handlePresentationClick = (e: MouseEvent) => {

  if (activePanel.value !== "presentation") return;
  if (e.button !== 0) return;

  const middle = window.innerWidth / 2;

  if (e.clientX < middle) {
    store.currentSlide = Math.max(0, store.currentSlide - 1);
    return;
  }

  if (store.currentSlide < store.renderedSlides.length - 1) {
    store.currentSlide++;
  }
};

/*
  Native app menu (Tauri).

  This is basically your top menu bar.
*/
const CreateMenu = async () => {

  const FileMenu = await Submenu.new({
    text: 'Fichier',
    items: [

      // quit app
      await MenuItem.new({
        id: 'quit',
        text: 'Fermer',
        action: () => {
          store.workspacePath = "";
          clearTmpFolder();
          appWindow.close();
        },
      }),

      // new project
      await MenuItem.new({
        id: 'new',
        text: 'Nouveau',
        action: () => createProject(),
        accelerator: 'CmdOrCtrl+N',
      }),

      // open project
      await MenuItem.new({
        id: 'open',
        text: 'Ouvrir',
        action: () => {
          activePanel.value = null;
          openProject();
          store.presentationVersion = 0;
        },
        accelerator: 'CmdOrCtrl+O',
      }),

      // save
      await MenuItem.new({
        id: 'save',
        text: 'Enregistrer',
        action: () => saveProject(),
        accelerator: 'CmdOrCtrl+S',
      }),

      // save as
      await MenuItem.new({
        id: 'save as',
        text: 'Enregistrer sous',
        action: () => saveProjectAs(),
        accelerator: 'CmdOrCtrl+Shift+S',
      }),

      // presentation toggle
      await MenuItem.new({
        id: 'presentation',
        text: 'Présentation',
        action: () => togglePresentation(),
        accelerator: 'Alt+P',
      }),
    ],
  });

  const editmenu = await Submenu.new({
    text: 'Édition',
    items: [

      await MenuItem.new({
        id: 'toggleEditor',
        text: "Toggle editor panel",
        action: () => toggle("editor"),
        accelerator: 'Alt+M',
      }),

      await MenuItem.new({
        id: 'Config',
        text: "Toggle authors panel",
        action: () => toggle("author"),
        accelerator: 'Alt+A',
      }),

      await MenuItem.new({
        id: 'Css',
        text: "Toggle CSS panel",
        action: () => toggle("css"),
        accelerator: 'Alt+C',
      }),
    ],
  });

  const menu = await Menu.new({
    items: [FileMenu, editmenu],
  });

  await menu.setAsAppMenu();
};

// build menu on startup
CreateMenu();

/*
  Register global listeners
*/
onMounted(() => {
  window.addEventListener('keydown', handleShortcuts);
  window.addEventListener("click", handlePresentationClick);
});

/*
  Cleanup (important to avoid leaks)
*/
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