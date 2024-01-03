import { codeToHtml } from "shikiji";
import { toJSONSchema } from "@gcornut/valibot-json-schema";
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
    <div className="group relative">
      <div
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />

      <div className="i-carbon-clipboa" />

      <CopyButton text={JSON.stringify(jsonSchema, null, 2)} />
    </div>
  );
}
