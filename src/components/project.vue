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

const renderedPages = computed(() => {
  return pages.value.map(page => md.render(page));
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
    v-html="page"
  />
</template>

<style scoped>
    .slide {
        width: 90%;
        min-height: 90vh;
        padding: 20px;
        margin: 1% 3%;
        border-radius: 5px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        scrollbar-width: none;
        -ms-overflow-style: none;
        h1{
            font-size: 2rem;
        }
        pre {
            padding: 1rem;
            overflow-x: auto;
        }
    }
    .slide::-webkit-scrollbar {
        display: none;
        }
</style>