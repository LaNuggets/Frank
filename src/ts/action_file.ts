import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useStore } from "./store";
import { convertCustomToHTML, preprocessMarkdown } from "./action_project";

/**
 * Create a new empty project workspace
 * and register its path in the global store.
 */
const createProject = async () => {
    const store = useStore();

    const workspace = await invoke<string>("create_project");

    store.setWorkspacePath(workspace);

    return workspace;
};

/**
 * Open an existing .codeprez project file,
 * extract it, and initialize the workspace paths.
 */
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

    // initialize project structure
    store.setPresentationPath("");
    store.setPresentationPath(`presentation.md`);
    store.setConfigPath(`config.json`);
    store.setStylePath(`style.css`);

    return workspace;
};

/**
 * Save current project state and re-zip workspace
 * using the last known save location.
 */
const saveProject = async () => {
    const store = useStore();

    if (store.presentationPath !== null) {
        const text = await readFile(store.presentationPath);

        const processed = await preprocessMarkdown(text);
        const html = convertCustomToHTML(processed);

        writeFile(store.presentationPath, html);
    }

    store.presentationVersion++;

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
};

/**
 * Save project under a new file path
 * and update the save location in store.
 */
const saveProjectAs = async () => {
    const store = useStore();

    if (store.presentationPath !== null) {
        const text = await readFile(store.presentationPath);

        const processed = await preprocessMarkdown(text);
        const html = convertCustomToHTML(processed);

        writeFile(store.presentationPath, html);
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
};

/**
 * Read a full file from the backend filesystem
 */
const readFile = async (fileName: string) => {
    return await invoke<string>("read_file", {
        fileName,
    });
};

/**
 * Write content into a file on the backend filesystem
 */
const writeFile = async (fileName: string, content: string) => {
    return await invoke("write_file", {
        fileName,
        content,
    });
};

/**
 * Read specific lines or ranges from a file
 * (used for code block extraction in slides)
 */
const readFileLines = async (
    filename: string,
    lines: string
): Promise<[string[], string | null]> => {
    return await invoke<[string[], string | null]>("read_file_lines_command", {
        filename,
        lines,
    });
};

/**
 * Get the workspace tree structure (for file explorer UI)
 */
const loadTree = async () => {
    return await invoke("get_workspace_tree");
};

/**
 * Clean temporary workspace folder
 * (used when closing or reopening projects)
 */
const clearTmpFolder = async () => {
    return await invoke("clear_tmp_folder");
};

/**
 * Build a safe filesystem path inside the workspace
 * from a relative asset path
 */
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
    buildFsPath,
};