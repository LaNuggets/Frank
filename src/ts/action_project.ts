import config from "../assets/markdown.config.json";
import { invoke } from "@tauri-apps/api/core";

const rules = config as unknown as Record<string, string>;

const convertCustomToHTML=(text: string): string =>{
  const tagRegex = /<\/>|<([^>]+)>/g;
  const stack: string[] = [];

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(text)) !== null) {
    result += text.slice(lastIndex, match.index);
    lastIndex = tagRegex.lastIndex;

    const token = match[0];

    if (token === "</>") {
      const tag = stack.pop();
      if (tag) result += `</${tag}>`;
      continue;
    }

    const inside = match[1];
    let style = "";

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

    result += `<span style="${style.trim()}">`;
    stack.push("span");
  }

  result += text.slice(lastIndex);

  while (stack.length) {
    result += `</span>`;
    stack.pop();
  }

  return result;
}

const convertHTMLToCustom=(html: string): string=> {
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

    if (match[0] === "</span>") {
      const tag = stack.pop();

      if (tag) result += "</>";

      continue;
    }

    const style = match[1];

    let attrs = "";

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

  while (stack.length) {
    result += "</>";
    stack.pop();
  }

  return result;
}


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
    rs: "rust",
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

  return mapping[normalizedExt] ?? null;
};

const preprocessMarkdown= async (content: string): Promise<string> => {
  const regex = /\?=(\!\[.*?\]\((.*?)\)|\[(.*?)\]\((.*?)#(.*?)\))/g;

  const matches = [...content.matchAll(regex)];

  let result = content;

  for (const match of matches) {
    const fullMatch = match[0];

    const isImage = fullMatch.includes("![");

    if (isImage) {
      const imagePath = match[2];

      await invoke("copy_file", { filePath: imagePath });

      const fileName = imagePath.split("\\").pop()?.split("/").pop();

      result = result.replace(
        fullMatch,
        `![image](./assets/${fileName})`
      );
    } else {
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
}

export {
    convertCustomToHTML,
    convertHTMLToCustom,
    preprocessMarkdown,
    getPrismLangForExtension
}