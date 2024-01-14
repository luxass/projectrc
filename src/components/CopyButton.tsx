import { createSignal, onCleanup } from "solid-js";

export interface CopyButtonProps {
  text: string
}
type CopyFn = (text: string) => Promise<boolean>;

export function CopyButton(props: CopyButtonProps) {
  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      return false;
    }
  };

  const [isCopied, setIsCopied] = createSignal(false);

  let timeout: NodeJS.Timeout;
  onCleanup(() => {
    if (timeout) clearTimeout(timeout);
  });

  const handleClick = async () => {
    const isCopiedValue = await copy(props.text);
    setIsCopied(isCopiedValue);
    if (isCopiedValue) {
      timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <button
      class="copy absolute right-2 top-2 flex items-center justify-center border border-gray-400/20 rounded p-2 opacity-0 group-hover:opacity-100"
      onClick={handleClick}
    >
      {isCopied() ? <span class="i-lucide-clipboard-check" /> : <span class="i-lucide-clipboard" />}
    </button>
  );
}
