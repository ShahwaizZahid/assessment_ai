# Adding or swapping AI models

Assessments call models through a small provider layer. The assessment API never imports OpenAI/Anthropic/Gemini/Groq directly.

## Contract

Every adapter in `src/services/ai/providers/` must export:

```js
export async function generate({ role, prompt, intakeData }) {
  return {
    provider: 'openai',
    model: 'gpt-4.1',
    role,
    promptVersion: prompt.version,
    status: 'completed', // or 'failed'
    outputData: { /* section JSON for that role */ },
    errorMessage: null,
    latencyMs: 1234,
  };
}
```

Roles and which report sections they own:

| Role | Env var | Expected `outputData` keys |
|------|---------|----------------------------|
| `reality_check` | `AI_PROVIDER_REALITY_CHECK` | `mvpRealityCheck`, `outcomeThatMatters`, `personas` |
| `feature_scope` | `AI_PROVIDER_FEATURE_SCOPE` | `betaScope`, `notToBuild` |
| `technical` | `AI_PROVIDER_TECHNICAL` | `techStack`, `investmentTimeline`, `visualArchitecture` |
| `risk_analysis` | `AI_PROVIDER_RISK_ANALYSIS` | `risks`, `validationQuestions` |

## Swap a model (no API change)

In `.env`:

```
AI_PROVIDER_REALITY_CHECK=openai
AI_PROVIDER_FEATURE_SCOPE=mock
AI_PROVIDER_TECHNICAL=mock
AI_PROVIDER_RISK_ANALYSIS=mock
```

Allowed values: `mock` (default), `openai`, `anthropic`, `gemini`, `groq`.

v1 ships working **mock** adapters only. The other files throw `501` until you implement `generate()`.

## Add a new provider

1. Create `src/services/ai/providers/<name>.js` with `generate()`.
2. Register it in `src/services/ai/provider.js` (`adapters` map).
3. Call HTTP APIs inside `generate()`. `withRetry()` in the orchestrator already applies timeout + 2 retries.
4. Return normalized JSON, not raw model text. `reconcile.js` merges section objects; it does not concatenate strings.
5. Set the role env var to `<name>` and restart the server.

## Prompt versions

Prompts live in `src/services/ai/prompts/*.v1.js`. When you change a prompt, bump `PROMPT_VERSION` in `src/services/ai/roles.js` so rows in `assessment_runs.prompt_version` stay traceable.

## After schema change (optional user)

```bash
npx prisma migrate dev --name assessment_user_optional
npx prisma generate
```
