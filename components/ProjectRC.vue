<script setup lang="ts">
import {
  getHighlighterCore,
} from "shikiji/core";
import { getWasmInlined } from "shikiji/wasm";

const { data: schema } = await useFetch("/api/schema");

const shiki = await getHighlighterCore({
  langs: [
    import("shikiji/langs/json.mjs"),
  ],
  themes: [
    import("shikiji/themes/vitesse-dark.mjs"),
  ],
  loadWasm: getWasmInlined,
});

const html
  = shiki.codeToHtml(JSON.stringify(schema.value || { message: "There was an error trying to fetch the schema" }, null, 2), {
    lang: "json",
    theme: "vitesse-dark",
  });
</script>

<template>
  <div my-4>
    <h2 text-xl my-2 font-semibold>
      You can see the schema used here.
    </h2>
    <div v-html="html" />
  </div>
</template>
