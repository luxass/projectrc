import { codeToHtml } from "shikiji";
import { toJSONSchema } from "@gcornut/valibot-json-schema";
import Link from "next/link";
import { SCHEMA } from "~/lib/schema";
import { CopyButton } from "~/components/CopyButton";

export default async function Home() {
  const jsonSchema = toJSONSchema({
    schema: SCHEMA,
  });
  const html = await codeToHtml(JSON.stringify(jsonSchema, null, 2), {
    lang: "json",
    themes: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
  });

  return (
    <>
      <h1>.projectrc</h1>

      <article>
        <p>
          Since you are here, you are probably wondering why and what this `.projectrc` is.
        </p>

        <p>
          Well, it&apos;s a file that are used by
          <Link href="https://luxass.dev">
            <code>my website</code>
          </Link>
          to generate a list of projects thare are being shown here.
        </p>

        You can see the schema used here.
      </article>

      <div className="group relative">
        <div
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />

        <CopyButton text={JSON.stringify(jsonSchema, null, 2)} />
      </div>
    </>
  );
}
