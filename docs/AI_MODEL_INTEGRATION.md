# Adding or swapping AI models

Assessments call models through a provider layer. The assessment API never imports OpenAI/Anthropic/Gemini/Groq directly.

## Default mapping (ticket)

| Role | Env var | Default provider | API key |
|------|---------|------------------|---------|
| `reality_check` | `AI_PROVIDER_REALITY_CHECK` | `openai` | `OPENAI_API_KEY` |
| `feature_scope` | `AI_PROVIDER_FEATURE_SCOPE` | `anthropic` | `ANTHROPIC_API_KEY` |
| `technical` | `AI_PROVIDER_TECHNICAL` | `gemini` | `GEMINI_API_KEY` |
| `risk_analysis` | `AI_PROVIDER_RISK_ANALYSIS` | `groq` | `GROQ_API_KEY` |

Optional model overrides: `OPENAI_MODEL`, `ANTHROPIC_MODEL`, `GEMINI_MODEL`, `GROQ_MODEL`.

If a key is missing, that role is stored as `failed` and the other roles still merge. If all four fail, the assessment is `failed`.

## Contract

Every adapter in `src/services/ai/providers/` must export:

```js
export async function generate({ role, prompt, intakeData }) {
  return {
    provider: 'openai',
    model: 'gpt-4o-mini',
    role,
    promptVersion: prompt.version,
    status: 'completed', // or 'failed'
    outputData: { /* section JSON for that role */ },
    errorMessage: null,
    latencyMs: 1234,
  };
}
```

`prompt` includes `{ version, role, system, user }`. Real adapters send `system`/`user` and parse JSON via `jsonOutput.js`.

Roles and which report sections they own:

| Role | Expected `outputData` keys |
|------|----------------------------|
| `reality_check` | `mvpRealityCheck`, `outcomeThatMatters`, `personas` |
| `feature_scope` | `betaScope`, `notToBuild` |
| `technical` | `techStack`, `investmentTimeline`, `visualArchitecture` |
| `risk_analysis` | `risks`, `validationQuestions` |

## Swap a model (no API change)

In `.env`:

```
AI_PROVIDER_REALITY_CHECK=openai
AI_PROVIDER_FEATURE_SCOPE=anthropic
AI_PROVIDER_TECHNICAL=gemini
AI_PROVIDER_RISK_ANALYSIS=groq
```

Allowed values: `mock`, `openai`, `anthropic`, `gemini`, `groq`.

Local without keys:

```
AI_PROVIDER_REALITY_CHECK=mock
AI_PROVIDER_FEATURE_SCOPE=mock
AI_PROVIDER_TECHNICAL=mock
AI_PROVIDER_RISK_ANALYSIS=mock
```

Restart the server after changing env.

## Add a new provider

1. Create `src/services/ai/providers/<name>.js` with `generate()`.
2. Register it in `src/services/ai/provider.js` (`adapters` map).
3. Call HTTP APIs inside `generate()`. Orchestrator already wraps calls with timeout (~45s) and 2 retries.
4. Return normalized JSON via `parseRoleOutput(role, raw)`. Do not concatenate raw text.
5. Set the role env var to `<name>` and restart.

## Prompt versions

Prompts live in `src/services/ai/prompts/*.v1.js`. When you change a prompt, bump `PROMPT_VERSION` in `src/services/ai/roles.js` so rows in `assessment_runs.prompt_version` stay traceable.
