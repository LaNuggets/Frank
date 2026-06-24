<script setup lang="ts">
    import { ref, watch, computed, onMounted } from "vue";
    import { useStore } from "../ts/store";
    import { readFile } from "../ts/action_file";
    import MarkdownIt from "markdown-it";
    const store = useStore();
    const content = ref("");
    const textDecoder = new TextDecoder();

    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    const getStyle = async () => {
        try {
            const css = await readFile("/tmp/codeprez/style.css");
            console.log(css);
            
            const existingStyle = document.getElementById("presentation-style");
            if (existingStyle) existingStyle.remove();
            
            const styleEl = document.createElement("style");
            styleEl.id = "presentation-style";
            styleEl.textContent = css;
            document.head.appendChild(styleEl);
        } catch  (e){
            console.log("erreur" + e);
        }
    };
    const pages = computed(() => {
    return content.value
        .split(/\n\s*-{3,}\s*\n/g)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    });
    // const renderedPages = computed(() => {
    //     return pages.value.map(page => {
    //         return md.render(page);
    //     });
    // });
    const renderedPages = computed(() =>
        pages.value.map(page => `<section>${md.render(page)}</section>`)
    );
    watch(
        () =>  [store.presentationPath,store.presentationVersion],
        async () => {
            const path = store.presentationPath
            if (!path) {
            content.value = "";
            return;
            }

            content.value = await readFile(path);
            await getStyle();
        },
        { immediate: true }
        );
    onMounted(() => {
        getStyle();
    });
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