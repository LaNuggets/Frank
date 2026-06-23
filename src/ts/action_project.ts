import config from "../assets/markdown.config.json";

const rules = config as unknown as Record<string, string>;

const presentation_mode = async () => {}

function convertCustomToHTML(text: string): string {
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

    const attrs = inside.split(/\s+/);

    for (const attr of attrs) {
      const m = attr.match(/(\w+)=["']?(.*?)["']?$/);

      if (!m) continue;

      const customKey = m[1];
      const value = m[2];

      const cssKey = rules[customKey];

      if (cssKey) {
        style += `${cssKey}:${value}; `;
      }
    }

    result += `<div style="${style.trim()}">`;
    stack.push("div");
  }

  result += text.slice(lastIndex);

  while (stack.length) {
    result += `</div>`;
    stack.pop();
  }

  return result;
}

function convertHTMLToCustom(html: string): string {
  const reverseRules: Record<string, string> = Object.fromEntries(
    Object.entries(rules).map(([k, v]) => [v, k])
  );

  const divRegex = /<div\s+style="([^"]*?)">|<\/div>/g;
  const stack: string[] = [];

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = divRegex.exec(html)) !== null) {
    result += html.slice(lastIndex, match.index);
    lastIndex = divRegex.lastIndex;

    if (match[0] === "</div>") {
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

    stack.push("div");
  }

  result += html.slice(lastIndex);

  while (stack.length) {
    result += "</>";
    stack.pop();
  }

  return result;
}

export {
    presentation_mode,
    convertCustomToHTML,
    convertHTMLToCustom
}