"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message = error.message;
  const statusCode = error.digest || "500";

  return (
    <html>
      <body>
        <div className="bg-default min-h-screen px-4">
          <main className="mx-auto max-w-xl pb-6 pt-16 sm:pt-24">
            <div className="text-center">
              <p className="text-emphasis text-sm font-semibold uppercase tracking-wide">{statusCode}</p>
              <h1 className="text-emphasis mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {message}
              </h1>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
