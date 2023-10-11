<template>
  <nav flex="~ wrap" items-center justify-between>
    <div flex gap-2 items-center>
      <Icon name="📋" size="32" />
      <h1>projectrc.luxass.dev</h1>
    </div>

    <NuxtLink href="https://github.com/luxass/projectrc.luxass.dev" title="GitHub Repository">
      <Icon name="octicon:mark-github" size="24" />
    </NuxtLink>
  </nav>

  <main mt-8 flex="~ col">
    <h1 font-semibold my-4 text-2xl>
      .projectrc
    </h1>

    <p>
      Since you are here, you are probably wondering why and what this <span
        bg="gray-700" p-0.5
        rounded
      >.projectrc</span> is.
    </p>

    <p>
      Well, it's a file that are used by <a
        href="https://github.com/luxass/luxass.dev/blob/main/scripts/update-site.ts"
        target="_blank" rel="noopener noreferrer" bg="gray-700" p-0.5 rounded
      >my website</a> to
      generate a list of projects that are being showed <a
        href="https://luxass.dev/projects" title="List of projects" target="_blank"
        rel="noopener noreferrer" bg="gray-700" p-0.5 rounded
      >here</a>.
    </p>

    <Suspense>
      <ProjectRC />
    </Suspense>
  </main>
</template>
