
<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useStore } from "../ts/store";
import { readFile, readFileLines, buildFsPath } from "../ts/action_file";
import { getPrismLangForExtension } from "../ts/action_project";

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
      const html = Prism.highlight(code, Prism.languages[lang], lang);

      return `<pre class="code-block language-${lang}"><code class="language-${lang}">${html}</code></pre>`;
    }

    return `<pre class="code-block"><code>${escapeMd.utils.escapeHtml(code)}</code></pre>`;
  },
});

const readFileLinesTyped = async (
  filename: string,
  lines: string = ""
): Promise<[string[], string | null]> => {
  return await readFileLines(filename, lines);
};

md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx];
  let src = token.attrGet("src") || "";

  if (!src.startsWith("http") && !src.startsWith("data:")) {
    const fsPath = buildFsPath(store.workspacePath!, src);
    src = convertFileSrc(fsPath);
  }

  return `<img src="${src}" alt="${token.content || ""}" />`;
};

async function preprocessCode(page: string): Promise<string> {
  const regex = /\[Code\]\(([^)#]+)#?([^)]*)\)/g;

  const matches = [...page.matchAll(regex)];

  for (const match of matches) {
    const full = match[0];
    const file = match[1];
    const range = match[2] || "";

    const fullPath = buildFsPath(store.workspacePath!, file);

    const [lines] = await readFileLinesTyped(fullPath, range);

    const cleanLines = lines.map((line: string) =>
      line
        .replace(/,\s*$/, "")
        .replace(/\r/g, "")
        .trimEnd()
    );

    const code = cleanLines.join("\n");

    const ext = file.split(".").pop()?.toLowerCase() || "";
    const lang = getPrismLangForExtension(ext) || "js";

    const highlighted =
      lang && Prism.languages[lang]
        ? Prism.highlight(code, Prism.languages[lang], lang)
        : escapeMd.utils.escapeHtml(code);

    const html = `
<pre class="code-block language-${lang}">
  <code class="language-${lang}">${highlighted}</code>
</pre>`;

    page = page.replace(full, html);
  }

  return page;
}

const pages = computed(() => {
  return content.value
    .split(/\n\s*-{3,}\s*\n/g)
    .map(p => p.trim())
    .filter(Boolean);
});

const renderedPages = computed(() => {
  return store.renderedSlides as string[];
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

    const slides = pages.value;

    const processed = await Promise.all(
      slides.map(async (s) => preprocessCode(s))
    );

    store.renderedSlides = processed.map(s => md.render(s));
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
