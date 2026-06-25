import config from "../assets/markdown.config.json";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "./store";
import { readFile } from "./action_file";

/**
 * CSS mapping rules used to convert custom markdown tags
 * into real inline CSS styles.
 */
const rules = config as unknown as Record<string, string>;


/**
 * Convert custom tags like <color=value>text</> into HTML spans
 * with inline styles.
 */
const convertCustomToHTML = (text: string): string => {

  // detect opening tags and closing </> tags
  const tagRegex = /<\/>|<([^>]+)>/g;

  const stack: string[] = [];

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(text)) !== null) {

    // keep text between tags
    result += text.slice(lastIndex, match.index);
    lastIndex = tagRegex.lastIndex;

    const token = match[0];

    // closing tag → close last opened span
    if (token === "</>") {
      const tag = stack.pop();
      if (tag) result += `</${tag}>`;
      continue;
    }

    const inside = match[1];
    let style = "";

    // convert custom attributes into CSS rules
    const attrRegex = /(\w+)=["']([^"']+)["']/g;

    let m: RegExpExecArray | null;

    while ((m = attrRegex.exec(inside)) !== null) {
      const customKey = m[1];
      const value = m[2];

      const cssKey = rules[customKey];

      if (cssKey) {
        style += `${cssKey}:${value}; `;
      }
    }

    // open span with computed style
    result += `<span style="${style.trim()}">`;
    stack.push("span");
  }

  result += text.slice(lastIndex);

  // close any unclosed tags safely
  while (stack.length) {
    result += `</span>`;
    stack.pop();
  }

  return result;
};


/**
 * Convert HTML back to custom syntax
 * (used when saving or exporting content)
 */
const convertHTMLToCustom = (html: string): string => {

  const reverseRules: Record<string, string> = Object.fromEntries(
    Object.entries(rules).map(([k, v]) => [v, k])
  );

  const divRegex = /<span\s+style="([^"]*?)">|<\/span>/g;

  const stack: string[] = [];

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = divRegex.exec(html)) !== null) {

    result += html.slice(lastIndex, match.index);
    lastIndex = divRegex.lastIndex;

    // closing span → custom closing tag
    if (match[0] === "</span>") {
      const tag = stack.pop();
      if (tag) result += "</>";
      continue;
    }

    const style = match[1];
    let attrs = "";

    // convert CSS back to custom attributes
    for (const [cssKey, customKey] of Object.entries(reverseRules)) {

      const regex = new RegExp(`${cssKey}\\s*:\\s*([^;]+)`);
      const m = style.match(regex);

      if (m) {
        attrs += `${customKey}="${m[1].trim()}" `;
      }
    }

    result += `<${attrs.trim()}>`;
    stack.push("span");
  }

  result += html.slice(lastIndex);

  // close remaining tags safely
  while (stack.length) {
    result += "</>";
    stack.pop();
  }

  return result;
};


/**
 * Map file extensions to Prism.js language identifiers
 * used for syntax highlighting
 */
const getPrismLangForExtension = (ext: string): string | null => {

  const normalizedExt = ext.toLowerCase();

  const mapping: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    css: "css",
    html: "markup",
    xml: "markup",
    json: "json",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    txt: "text",
  };

  return mapping[normalizedExt] ?? "javascript";
};


/**
 * Preprocess markdown content before rendering:
 * - handles image imports
 * - handles code file imports
 */
const preprocessMarkdown = async (content: string): Promise<string> => {

  const regex = /\?=(\!\[.*?\]\((.*?)\)|\[(.*?)\]\((.*?)#(.*?)\))/g;

  const matches = [...content.matchAll(regex)];

  let result = content;

  for (const match of matches) {

    const fullMatch = match[0];
    const isImage = fullMatch.includes("![");

    // image import handling
    if (isImage) {

      const imagePath = match[2];

      await invoke("copy_file", { filePath: imagePath });

      const fileName = imagePath.split("\\").pop()?.split("/").pop();

      result = result.replace(
        fullMatch,
        `![image](./assets/${fileName})`
      );

    } else {

      // code import handling
      const filePath = match[4];
      const lines = match[5];

      await invoke("copy_file", { filePath });

      const fileName = filePath.split("\\").pop()?.split("/").pop();

      result = result.replace(
        fullMatch,
        `[code](./assets/${fileName}#${lines})`
      );
    }
  }

  return result;
};


/**
 * Generate the cover slide from config.json
 */
const generateCoverSlide = (config: {
  title?: string;
  authors?: string[];
}): string => {

  const title = config.title || "Untitled";
  const authors = (config.authors || []).join(", ");

  return `
<section class="cover-slide" style="
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 10%;
">

  <div style="
    width: 100%;
    max-width: 900px;
  ">

    <h1 style="
      font-size: 3rem;
      margin: 0;
      width: 100%;
      text-align: left;
    ">
      ${title}
    </h1>

    <p style="
      margin-top: 20px;
      font-size: 1.2rem;
      opacity: 0.7;
      width: 100%;
      text-align: left;
    ">
      ${authors}
    </p>

  </div>

</section>
`;
};


/**
 * Load config.json and generate the first slide (cover slide)
 */
const loadConfigSlide = async (): Promise<string> => {

  const store = useStore();

  try {

    if (!store.configPath) return "";

    const raw = await readFile(store.configPath);
    const config = JSON.parse(raw);

    return generateCoverSlide(config);

  } catch (e) {
    console.log("config error:", e);
    return "";
  }
};


/**
 * Exports used by the renderer and project system
 */
export {
  convertCustomToHTML,
  convertHTMLToCustom,
  preprocessMarkdown,
  getPrismLangForExtension,
  generateCoverSlide,
  loadConfigSlide
};