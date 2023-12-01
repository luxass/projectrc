import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: "Lexend",
      },
    }),
  ],
  shortcuts: {
    "bg-active": "bg-gray:10",
    "bg-base": "bg-white dark:bg-[#151515]",
    "bg-secondary": "bg-gray:5",
    "border-base": "border-gray/20",
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
});
