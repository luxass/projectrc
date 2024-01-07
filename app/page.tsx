import { codeToHtml } from "shikiji";
import Link from "next/link";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PROJECTRC_SCHEMA } from "~/lib/schema";
import { CopyButton } from "~/components/CopyButton";

export default async function Home() {
  const jsonSchema = zodToJsonSchema(PROJECTRC_SCHEMA);

  const html = await codeToHtml(JSON.stringify(jsonSchema, null, 2), {
    lang: "json",
    themes: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
  });

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold">.projectrc</h1>

      <article>
        <p>
          Since you are here, you are probably wondering why and what this
          {" "}
          <span className="rounded bg-gray-200 p-0.5 dark:bg-gray-400/10">.projectrc</span>
          {" "}
          is.
        </p>
        <p>
          It&apos;s just a little file that I use on
          {" "}
          <Link href="https://luxass.dev" className="rounded bg-gray-200 p-0.5 dark:bg-gray-400/10">
            <code>my website</code>
          </Link>
          {" "}
          to generate a list of projects that are being showcased
          {" "}
          <Link className="rounded bg-gray-200 p-0.5 dark:bg-gray-400/10" href="https://luxass.dev/projects">
            here
          </Link>
          .
        </p>
      </article>

      <div className="my-4">
        <h2 className="my-2 text-xl font-semibold">You can see the schema used here.</h2>

        <div className="group relative">
          <div
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
          <CopyButton text={JSON.stringify(jsonSchema, null, 2)} />
        </div>
      </div>
    </>
  );
}
