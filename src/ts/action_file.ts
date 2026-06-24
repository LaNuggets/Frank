import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useStore } from "./store";
import {convertCustomToHTML,preprocessMarkdown} from './action_project'
const createProject = async () => {
    const store = useStore();

    const workspace = await invoke<string>("create_project");

    store.setWorkspacePath(workspace);

    return workspace;
}

const openProject = async () => {
    clearTmpFolder();
    const store = useStore();
    const file = await open({
        multiple: false,
        filters: [
            {
                name: "CodePrez",
                extensions: ["codeprez"],
            },
        ],
    });

    if (!file) return null;

    const workspace = await invoke<string>("unzip_command", {
        zipPath: file,
    });

    store.setWorkspacePath(workspace);
    store.setPresentationPath("")
    store.setPresentationPath(`presentation.md`);
    store.setConfigPath(`config.json`);
    store.setStylePath(`style.css`);
    return workspace;
}

const saveProject = async () => {
    const store = useStore();
    if (store.presentationPath!==null) {
        const text = await readFile(store.presentationPath);
        const processed = await preprocessMarkdown(text);
        const html = convertCustomToHTML(processed);
        writeFile(store.presentationPath,html)
    }
    store.presentationVersion++
    return await invoke("zip_command", {
        zipPath: store.savePath,
        filesName: [
            "assets",
            "env",
            "config.json",
            "presentation.md",
            "style.css",
        ],
    });
}

const saveProjectAs = async () => {
    const store = useStore();
    if (store.presentationPath!==null) {
        const text = await readFile(store.presentationPath);
        const processed = await preprocessMarkdown(text);
        const html = convertCustomToHTML(processed);
        writeFile(store.presentationPath,html)
    }
    const zipPath = await save({
        filters: [
            {
                name: "CodePrez",
                extensions: ["codeprez"],
            },
        ],
    });

    if (!zipPath) return;

    const result = await invoke("zip_command", {
        zipPath,
        filesName: [
            "assets",
            "env",
            "config.json",
            "presentation.md",
            "style.css",
        ],
    });

    store.setSavePath(zipPath);

    return result;
}

const readFile = async (fileName: string) => {
    return await invoke<string>("read_file", {
        fileName,
    });
}

const writeFile = async (fileName: string, content: string) => {
    return await invoke("write_file", {
        fileName,
        content,
    });
}

const readFileLines = async (
  filename: string,
  lines: string
): Promise<[string[], string | null]> => {
  return await invoke<[string[], string | null]>("read_file_lines_command", {
    filename,
    lines,
  });
};

const loadTree = async () => {
    return await invoke("get_workspace_tree");
}

const clearTmpFolder = async () => {
    return await invoke("clear_tmp_folder");
}

function buildFsPath(base: string, src: string) {
  const baseDir = base.replace(/\\/g, "/");

  const projectRoot = baseDir;

  const cleanSrc = src.replace(/^(\.\/|\/)/, "");

  return `${projectRoot}/${cleanSrc}`;
}

export {
    createProject,
    openProject,
    saveProject,
    saveProjectAs,
    readFile,
    writeFile,
    readFileLines,
    loadTree,
    clearTmpFolder,
    buildFsPath
}