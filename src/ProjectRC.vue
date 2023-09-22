<script setup lang="ts">
import {
  getHighlighterCore,
} from "shikiji/core";
import { getWasmInlined } from "shikiji/wasm";
import projectrcSchema from "./assets/schema.json";

const shiki = await getHighlighterCore({
  langs: [
    import("shikiji/langs/json.mjs"),
  ],
  themes: [
    import("shikiji/themes/vitesse-dark.mjs"),
  ],
  loadWasm: getWasmInlined,
});

const code = shiki.codeToHtml(JSON.stringify(projectrcSchema, null, 2), {
  lang: "json",
  theme: "vitesse-dark",
});
</script>

<template>
  <div v-html="code" />
</template>
