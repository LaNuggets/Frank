import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useStore } from "./store";

const createProject = async () => {
    const store = useStore();

    const workspace = await invoke<string>("create_project");

    store.setWorkspacePath(workspace);

    return workspace;
}

const openProject = async () => {
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

    return workspace;
}

const saveProject = async () => {
    const store = useStore();

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

const readFile = async (path: string) => {
    return await invoke<string>("read_file", {
        path,
    });
}

const writeFile = async (path: string, content: string) => {
    return await invoke("write_file", {
        path,
        content,
    });
}

const readFileLines = async (filename: string,lines: string) => {
    return await invoke("read_file_lines_command", {
        filename,
        lines,
    });
}

const loadTree = async () => {
    return await invoke("get_workspace_tree");
}

const clearTmpFolder = async () => {
    return await invoke("clear_tmp_folder");
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
    clearTmpFolder
}