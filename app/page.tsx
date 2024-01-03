import { codeToHtml } from "shikiji";
import { toJSONSchema } from "@gcornut/valibot-json-schema";
import { SCHEMA } from "~/lib/schema";

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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div dangerouslySetInnerHTML={{
        __html: html,
      }}
      />
    </main>
  );
}
