<script setup lang="ts">
const mode = useColorMode();
const isDark = computed<boolean>({
  get() {
    return mode.value === "dark";
  },
  set() {
    mode.preference = isDark.value ? "light" : "dark";
  },
});

function toggle() {
  isDark.value = !isDark.value;
}
</script>

<template>
  <nav class="flex flex-wrap items-center justify-between">
    <div class="flex items-center gap-2">
      <Icon name="📋" size="32" />
      <h1>projectrc.luxass.dev</h1>
    </div>

    <div class="flex items-center justify-between gap-2">
      <NuxtLink href="https://github.com/luxass/projectrc.luxass.dev">
        <Icon name="octicon:mark-github" size="24" />
      </NuxtLink>

      <ClientOnly>
        <ColorScheme tag="span">
          <button class="ml1 text-lg op-50 hover:op-75" title="Toggle Dark Mode" @click="toggle">
            <Icon :name="isDark ? 'carbon:moon' : 'carbon:sun'" size="24" />
          </button>
        </ColorScheme>

        <template #fallback>
          <button class="ml1 text-lg op-50 hover:op-75" title="Toggle Dark Mode">
            <Icon name="carbon:moon" size="24" />
          </button>
        </template>
      </ClientOnly>
    </div>
  </nav>
  <main class="mt-8 flex flex-col">
    <h1 class="my-4 text-2xl font-semibold">
      .projectrc
    </h1>

    <p>
      Since you are here, you are probably wondering why and what this <span
        class="rounded bg-gray-200 dark:bg-active p-0.5"
      >.projectrc</span>
      is.
    </p>

    <p>
      Well, it's a file that are used by <a
        class="rounded bg-gray-200 dark:bg-active p-0.5"
        href="https://github.com/luxass/luxass.dev/blob/main/scripts/update-site.ts" rel="noopener noreferrer" target="_blank"
      >my website</a> to
      generate a list of projects that are being showed <a
        class="rounded bg-gray-200 dark:bg-active p-0.5" href="https://luxass.dev/projects"
        rel="noopener noreferrer" target="_blank" title="List of projects"
      >here</a>.
    </p>

    <Suspense>
      <ClientOnly>
        <ProjectRC />
      </ClientOnly>
    </Suspense>
  </main>
</template>
