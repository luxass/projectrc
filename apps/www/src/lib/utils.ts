const GLOBAL_TEXT_DECODER = new TextDecoder();

export function base64ToString(str: string): string {
  const byteArray = new Uint8Array(
    atob(str)
      .split("")
      .map((char) => char.charCodeAt(0)),
  );
  return GLOBAL_TEXT_DECODER.decode(byteArray);
}

export const SITE_URL
  = import.meta.env.VERCEL_ENV === "production"
    ? "https://mosaic.luxass.dev"
    : import.meta.env.VERCEL_ENV === "preview"
      ? `https://${import.meta.env.VERCEL_URL}`
      : `http://localhost:${import.meta.env.PORT || 4321}`;
