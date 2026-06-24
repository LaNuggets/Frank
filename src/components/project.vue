<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useStore } from "../ts/store";
import { readFile, readFileLines, buildFsPath } from "../ts/action_file";
import { getPrismLangForExtension, loadConfigSlide } from "../ts/action_project";

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

// Markdown engine instance (used everywhere for rendering slides)
const escapeMd = new MarkdownIt();
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,

  // Prism syntax highlighting hook
  highlight(code: string, lang: string): string {
    if (lang && Prism.languages[lang]) {
      const html = Prism.highlight(code, Prism.languages[lang], lang);

      return `<pre class="code-block language-${lang}"><code class="language-${lang}">${html}</code></pre>`;
    }

    // fallback when language is unknown
    return `<pre class="code-block"><code>${escapeMd.utils.escapeHtml(code)}</code></pre>`;
  },
});

/*
  Small helper around readFileLines

  (kept here because backend sometimes returns weird shapes)
*/
const readFileLinesTyped = async (
  filename: string,
  lines: string = ""
): Promise<[string[], string | null]> => {
  return await readFileLines(filename, lines);
};

/*
  Image override for Markdown

  - local images → converted to Tauri file URL
  - remote images → left untouched
*/
md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx];
  let src = token.attrGet("src") || "";

  if (!src.startsWith("http") && !src.startsWith("data:")) {
    const fsPath = buildFsPath(store.workspacePath!, src);
    src = convertFileSrc(fsPath);
  }

  return `<img src="${src}" alt="${token.content || ""}" />`;
};

/*
  Code preprocessing step

  This is where we replace:
  [Code](file.js#1-10)

  → actual highlighted code block
*/
async function preprocessCode(page: string): Promise<string> {
  const regex = /\[Code\]\(([^)#]+)#?([^)]*)\)/g;

  const matches = [...page.matchAll(regex)];

  for (const match of matches) {
    const full = match[0];
    const file = match[1];
    const range = match[2] || "";

    const fullPath = buildFsPath(store.workspacePath!, file);

    const [lines] = await readFileLinesTyped(fullPath, range);

    /*
      Clean-up step:
      - remove trailing commas (common formatting issue)
      - remove carriage returns
      - trim useless spaces at line end
    */
    const cleanLines = lines.map((line: string) =>
      line
        .replace(/,\s*$/, "")
        .replace(/\r/g, "")
        .trimEnd()
    );

    const code = cleanLines.join("\n");

    // detect language from file extension
    const ext = file.split(".").pop()?.toLowerCase() || "";
    const lang = getPrismLangForExtension(ext) || "js";

    // highlight with Prism if possible
    const highlighted =
      lang && Prism.languages[lang]
        ? Prism.highlight(code, Prism.languages[lang], lang)
        : escapeMd.utils.escapeHtml(code);

    const html = `
<pre class="code-block language-${lang}">
  <code class="language-${lang}">${highlighted}</code>
</pre>`;

    // replace original markdown tag with real HTML
    page = page.replace(full, html);
  }

  return page;
}

/*
  Split file into slides

  Separator: "---"
*/
const pages = computed(() => {
  return content.value
    .split(/\n\s*-{3,}\s*\n/g)
    .map(p => p.trim())
    .filter(Boolean);
});

/*
  Final slides coming from store
  (includes presentation mode already processed data)
*/
const renderedPages = computed(() => {
  return store.renderedSlides as string[];
});

/*
  Inject global CSS dynamically

  (used for slide theme + background fix)
*/
const applyStyle = async () => {
  try {
    const css = await readFile("style.css");

    const bgMatch = css.match(/section\s*\{[^}]*background-color\s*:\s*([^;]+);/);
    const bg = bgMatch ? bgMatch[1].trim() : "";

    const existingStyle = document.getElementById("presentation-style");
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement("style");
    styleEl.id = "presentation-style";

    styleEl.textContent =
      css + (bg ? `\n.slide { background-color: ${bg}; }` : "");

    document.head.appendChild(styleEl);
  } catch (e) {
    console.log("style load error:", e);
  }
};

/*
  Main watcher:

  Whenever project changes:
  - load markdown file
  - apply style
  - preprocess code blocks
  - render markdown
  - inject cover slide + slides into store
*/
watch(
  () => [store.presentationPath, store.presentationVersion],
  async () => {
    const path = store.presentationPath;

    // reset everything if no file
    if (!path) {
      content.value = "";
      store.renderedSlides = [];
      return;
    }

    content.value = await readFile(path);
    await applyStyle();

    // load cover slide (title + authors)
    const configSlide = await loadConfigSlide();

    const slides = pages.value;

    // preprocess all code blocks first
    const processed = await Promise.all(
      slides.map((s) => preprocessCode(s))
    );

    // then render markdown
    const finalSlides = processed.map((s) => md.render(s));

    // inject cover slide as first slide
    store.renderedSlides = [
      configSlide,
      ...finalSlides
    ];
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

        /* This is because a div between slide and pre is created which makes pre no longer have a good height */
    .slide > div {
        height: 100%;
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
