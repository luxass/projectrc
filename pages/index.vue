<template>
  <h1 class="underline underline-offset-5 underline-blue-600">
    .projectrc
  </h1>

  <p>
    Since you are here, you are probably wondering why and what this <span
      class="underline underline-offset-5 underline-blue-700"
    >.projectrc</span> is.
  </p>

  <p>
    Well, it's a file that are used by <a
      href="https://github.com/luxass/luxass.dev/blob/main/scripts/update-site.ts"
      target="_blank" rel="noopener noreferrer" class="underline underline-offset-5 underline-blue-600"
    >my website</a> to
    generate a list of projects that are being showed <a
      href="https://luxass.dev/projects" target="_blank"
      rel="noopener noreferrer" class="underline underline-offset-5 underline-blue-600"
    >here</a>.
  </p>

  <Suspense>
    <NuxtIsland name="ProjectRC" />
  </Suspense>
</template>
