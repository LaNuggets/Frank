<script setup lang="ts">
    import { ref, watch, computed } from "vue";
    import { useStore } from "../ts/store";
    import { readFile } from "../ts/action_file";
    import MarkdownIt from "markdown-it";
    const store = useStore();
    const content = ref("");

    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });
    const pages = computed(() => {
    return content.value
        .split(/\n\s*-{3,}\s*\n/g)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    });
    const renderedPages = computed(() => {
        return pages.value.map(page => {
            return md.render(page);
        });
    });
    watch(
        () =>  [store.presentationPath,store.presentationVersion],
        async () => {
            const path = store.presentationPath
            if (!path) {
            content.value = "";
            return;
            }

            content.value = await readFile(path);
        },
        { immediate: true }
        );
</script>

<template>
        <div
            v-for="(page, index) in renderedPages"
            :key="index"
            class="slide"
            v-html="page"
        />
</template>

<style scoped>
    .slide {
        width: 90%;
        min-height: 90vh;
        padding: 20px;
        margin: 1% 5%;
        border-radius: 5px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        h1{
            font-size: 2rem;
        }
        pre {
            padding: 1rem;
            overflow-x: auto;
        }
    }
</style>