"use client";

import { useEffect, useState } from "react";
import { useClipboard } from "~/hooks/use-clipboard";

export interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const copy = useClipboard();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isCopied]);

  return (
    <button
      className="copy absolute right-2 top-2 flex items-center justify-center rounded border border-gray-400/20 p-2 opacity-0 group-hover:opacity-100"
      onClick={async () => {
        const isCopied = await copy(text);
        setIsCopied(isCopied);
      }}
    >
      {isCopied
        ? (
          <span className="i-lucide-clipboard-check" />
          )
        : (
          <span className="i-lucide-clipboard" />
          )}
    </button>
  );
}
