<script setup lang="ts">
const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <nav flex="~ wrap" items-center justify-between>
    <div flex gap-2 items-center>
      <Icon name="📋" size="32" />
      <h1>projectrc.luxass.dev</h1>
    </div>

    <div flex items-center justify-between gap-2>
      <NuxtLink href="https://github.com/luxass/projectrc.luxass.dev">
        <Icon name="octicon:mark-github" size="24" />
      </NuxtLink>

      <button title="Toggle Dark Mode" ml1 text-lg op="50 hover:75" @click="toggleDark()">
        <ClientOnly>
          <Icon :name="isDark ? 'carbon:sun' : 'carbon:moon'" size="24" />

          <template #fallback>
            <Icon name="mdi:loading" size="24" class="animate-spin" />
          </template>
        </ClientOnly>
      </button>
    </div>
  </nav>
  <main mt-8 flex="~ col">
    <h1 font-semibold my-4 text-2xl>
      .projectrc
    </h1>

    <p>
      Since you are here, you are probably wondering why and what this <span
        bg="gray-200 dark:active" p-0.5
        rounded
      >.projectrc</span>
      is.
    </p>

    <p>
      Well, it's a file that are used by <a
        href="https://github.com/luxass/luxass.dev/blob/main/scripts/update-site.ts"
        target="_blank" rel="noopener noreferrer" bg="gray-200 dark:active" p-0.5 rounded
      >my website</a> to
      generate a list of projects that are being showed <a
        href="https://luxass.dev/projects" title="List of projects"
        target="_blank" rel="noopener noreferrer" bg="gray-200 dark:active" p-0.5 rounded
      >here</a>.
    </p>

    <Suspense>
      <ClientOnly>
        <ProjectRC />
      </ClientOnly>
    </Suspense>
  </main>
</template>
