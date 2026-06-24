import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('global', () => {
    // Where the temporary workspace lives (used for file processing, previews, etc.)
    const workspacePath = ref<string | null>()

    // Where the project is saved on disk (persisted via localStorage)
    const savePath = ref<string | null>(localStorage.getItem('save'))

    // Path to the markdown presentation file
    const presentationPath = ref<string | null>(null)

    // Path to the config.json (title, authors, duration...)
    const configPath = ref<string | null>(null)

    // Path to the global CSS file for slides styling
    const stylePath = ref<string | null>(null)

    // Used to force refresh/re-render when presentation changes
    const presentationVersion = ref<number>(0)

    // Final rendered HTML slides ready to display in presentation mode
    const renderedSlides = ref<string[]>([])

    // Current slide index in presentation mode
    const currentSlide = ref<number>(0)

    const setWorkspacePath = (newWorkspacePath: string) => {
        workspacePath.value = newWorkspacePath
        localStorage.setItem('workspace', newWorkspacePath)
    }

    const removeWorkspacePath = () => {
        workspacePath.value = null
        localStorage.removeItem('workspace')
    }

    const setSavePath = (newSavePath: string) => {
        savePath.value = newSavePath
        localStorage.setItem('save', newSavePath)
    }

    const removeSavePath = () => {
        savePath.value = null
        localStorage.removeItem('save')
    }

    const setPresentationPath = (newPresentationPath: string) => {
        presentationPath.value = newPresentationPath
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
        presentationVersion,
        currentSlide,
        renderedSlides,
        setWorkspacePath,
        removeWorkspacePath,
        setSavePath,
        removeSavePath,
        setPresentationPath,
        setConfigPath,
        setStylePath
    }
})