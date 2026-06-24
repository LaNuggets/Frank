<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useStore } from "../ts/store";
import { readFile,buildFsPath } from "../ts/action_file";

import MarkdownIt from "markdown-it";

import Prism from "prismjs";
import { convertFileSrc } from "@tauri-apps/api/core";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";

import "prismjs/themes/prism-tomorrow.css";

const store = useStore();
const content = ref("");

const escapeMd = new MarkdownIt();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code: string, lang: string): string {
    if (lang && Prism.languages[lang]) {
      const html = Prism.highlight(
        code,
        Prism.languages[lang],
        lang
      );

      return `<pre class="code-block language-${lang}"><code class="language-${lang}">${html}</code></pre>`;
    }

    return `<pre class="code-block"><code>${escapeMd.utils.escapeHtml(code)}</code></pre>`;
  }
});
md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx];
  let src = token.attrGet("src") || "";
  if (!src.startsWith("http") && !src.startsWith("data:")) {
    const fsPath = buildFsPath(store.workspacePath!, src);
    src = convertFileSrc(fsPath);
  }
  const alt = token.content || "";
  return `<img src="${src}" alt="${alt}" />`;
};

const pages = computed(() => {
  return content.value
    .split(/\n\s*-{3,}\s*\n/g)
    .map(p => p.trim())
    .filter(Boolean);
});

const applyStyle = async () => {
    try {
        const css = await readFile("style.css");

        // I face an issue with background not applying to the slide
        // This wierd pattern is for that 🤡
        const bgMatch = css.match(/section\s*\{[^}]*background-color\s*:\s*([^;]+);/);
        const bg = bgMatch ? bgMatch[1].trim() : "";

        const existingStyle = document.getElementById("presentation-style");
        if (existingStyle) existingStyle.remove();

        const styleEl = document.createElement("style");
        styleEl.id = "presentation-style";

        // Same goes here background issue
        styleEl.textContent = css + (bg ? `\n.slide { background-color: ${bg}; }` : "");
        document.head.appendChild(styleEl);
    } catch (e) {
        console.log("erreur" + e);
    }
};
const renderedPages = computed(() => {
    return pages.value.map(page => {
        return md.render(page);
    });
});

watch(
  () => [store.presentationPath, store.presentationVersion],
  async () => {
    const path = store.presentationPath;

    if (!path) {
      content.value = "";
      store.renderedSlides = [];
      return;
    }

    content.value = await readFile(path);
    await applyStyle();

    const slidePages = content.value
      .split(/\n\s*-{3,}\s*\n/g)
      .map(p => p.trim())
      .filter(Boolean);

    store.renderedSlides = slidePages.map(page =>
      md.render(page)
    );
  },
  { immediate: true }
);
</script>

<template>
    <div
        v-for="(page, index) in renderedPages"
        :key="index"
        class="slide"
    >
    <div v-html="page" />
    <span class="slide-number">{{ index + 1 }} / {{ renderedPages.length }}</span>
  </div>

</template>

<style scoped>
    .slide {
        position: relative;
        width: 90%;
        height: 90vh;
        min-height: 90vh;
        padding: 20px;
        margin: 1% 3%;
        border-radius: 5px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .slide::-webkit-scrollbar {
        display: none;
    }

    .slide section {
        flex-direction: column !important;
        min-height: 100%;
        width: 100%;
        box-sizing: border-box;
    }

    .slide-number {
        position: absolute;
        bottom: 12px;
        right: 16px;
        font-size: 0.85rem;
        opacity: 0.6;
        color: white;
        background: rgba(0, 0, 0, 0.3);
        padding: 2px 8px;
        border-radius: 4px;
    }
</style>
