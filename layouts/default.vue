<template>
  <slot />
</template>

<style>
html {
  @apply antialiased touch-manipulation scroll-smooth text-base;
  text-rendering: optimizeLegibility;
}

body {
  @apply text-neutral-300 bg-neutral-900 py-8 min-h-screen max-w-4xl md:!mx-auto !mx-4 font-sans flex flex-col justify-between min-h-100dvh;
}

.shiki {
  @apply overflow-auto;
}

p {
  @apply line-height-relaxed;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  @apply text-neutral-100 font-semibold my-8;
}

h1 {
  @apply text-2xl;
}

h2 {
  @apply text-xl;
}

h3 {
  @apply text-lg;
}

h4 {
  @apply text-base;
}

h5 {
  @apply text-sm;
}

h6 {
  @apply text-xs;
}

strong {
  @apply font-medium text-neutral-100;
}

img {
  @apply mx-auto rounded my-6;
}
</style>
