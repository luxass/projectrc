import {
  defineConfig,
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
    presetIcons({
      scale: 1.3,
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
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
