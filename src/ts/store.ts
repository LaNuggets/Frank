import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('global', () => {
    // workspacePath contain the path to the tmp floder.
    const workspacePath = ref<string | null>()
    // savePath contain the path of where is save the project on save.
    const savePath = ref<string | null>(localStorage.getItem('save'))
    const presentationPath = ref<string | null>(null)
    const configPath = ref<string | null>(null)
    const stylePath = ref<string | null>(null)

    const setWorkspacePath = (newWorkspacePath: string) => {
        workspacePath.value = newWorkspacePath
        localStorage.setItem('workspace', newWorkspacePath);
    }

    const removeWorkspacePath = () => {
        workspacePath.value = null
        localStorage.removeItem('workspace');
    }

    const setSavePath = (newSavePath: string) => {
        savePath.value = newSavePath
        localStorage.setItem('save', newSavePath);
    }

    const removeSavePath = () => {
        savePath.value = null
        localStorage.removeItem('save');
    }
    const setPresentationPath = (newPresentationPath: string) => {
        presentationPath.value =  newPresentationPath
    }
    const setConfigPath = (newConfigPath: string) => {
        configPath.value = newConfigPath
    }
    const setStylePath = (newStylePath: string) => {
        stylePath.value = newStylePath
    }
    return {
        workspacePath,
        savePath,
        presentationPath,
        configPath,
        stylePath,
        setWorkspacePath,
        removeWorkspacePath,
        setSavePath,
        removeSavePath,
        setPresentationPath,
        setConfigPath,
        setStylePath
    }
})