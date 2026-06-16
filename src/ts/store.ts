import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('global', () => {
    const workspacePath = ref<string | null>(localStorage.getItem('workspace'))
    const savePath = ref<string | null>(localStorage.getItem('save'))

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

    return {
        workspacePath,
        savePath,
        setWorkspacePath,
        removeWorkspacePath,
        setSavePath,
        removeSavePath
    }
})