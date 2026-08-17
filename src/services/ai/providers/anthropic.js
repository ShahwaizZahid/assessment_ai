import Anthropic from "@anthropic-ai/sdk";
import { parseRoleOutput } from "../jsonOutput.js";
import { requireApiKey, requirePrompt } from "./requireKey.js";

export async function generate({ role, prompt }) {
  const started = Date.now();
  const { system, user, version } = requirePrompt(prompt);
  const client = new Anthropic({ apiKey: requireApiKey("ANTHROPIC_API_KEY") });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  const raw = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  const outputData = parseRoleOutput(role, raw);

  return {
    provider: "anthropic",
    model: message.model || model,
    role,
    promptVersion: version || "v1",
    status: "completed",
    outputData,
    errorMessage: null,
    latencyMs: Date.now() - started,
  };
}
