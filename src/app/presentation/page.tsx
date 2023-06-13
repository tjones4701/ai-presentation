import { JsonViewer } from "@/components/json-viewer";
import { createChatCompletion } from "@/server/open-ai/ai";

export type Presentation = {
  topic: string;
  outcome: string;
  themes: string[];
}
// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default async function Page() {
  const presentation: Presentation = {
    topic: "The movie waterworld",
    themes: ["exciting", "plot twist"],
    outcome: "Rent from blockbuster"
  }

  const promptParts = [`I would like you to create a short presentation based on the following:`];
  promptParts.push(presentation.topic);
  promptParts.push(`The themes of the presentation should be:`);
  promptParts.push(presentation.themes.join(", "));
  promptParts.push("This presentation should have the goal of promoting the following outcome:");
  promptParts.push(presentation.outcome);
  promptParts.push("When creating this presentation please structure this in the form of slides. With slide starting with the following text: ##SLIDE##");

  const prompt = promptParts.join("\n");
  const data = await createChatCompletion(prompt);
  return <JsonViewer>{data}</JsonViewer>
}