import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useStore } from "./store";
import {convertCustomToHTML} from './action_project'
const createProject = async () => {
    const store = useStore();

    const workspace = await invoke<string>("create_project");

    store.setWorkspacePath(workspace);

    return workspace;
}

const openProject = async () => {
    const store = useStore();
    store.presentationVersion++
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

    store.setPresentationPath(`${workspace}/presentation.md`);
    store.setConfigPath(`${workspace}/config.json`);
    store.setStylePath(`${workspace}/style.css`);
    return workspace;
}

const saveProject = async () => {
    const store = useStore();
    if (store.presentationPath!==null) {
        const text = await readFile(store.presentationPath)
        const html = convertCustomToHTML(text);
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
        const text = await readFile(store.presentationPath)
        const html = convertCustomToHTML(text);
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

const readFileLines = async (fileName: string,lines: string) => {
    return await invoke("read_file_lines_command", {
        fileName,
        lines,
    });
}

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