import { prisma } from '../../configurations/prisma.js';
import { logger } from '../../utils/logger.js';
import { getProvider, resolveProviderName } from './provider.js';
import { withRetry } from './retry.js';
import { reconcile } from './reconcile.js';
import { PROMPT_VERSION, ROLE_LIST, ROLES } from './roles.js';
import { buildRealityCheckPrompt } from './prompts/realityCheck.v1.js';
import { buildFeatureScopePrompt } from './prompts/featureScope.v1.js';
import { buildTechnicalPrompt } from './prompts/technical.v1.js';
import { buildRisksPrompt } from './prompts/risks.v1.js';

const promptBuilders = {
  [ROLES.REALITY_CHECK]: buildRealityCheckPrompt,
  [ROLES.FEATURE_SCOPE]: buildFeatureScopePrompt,
  [ROLES.TECHNICAL]: buildTechnicalPrompt,
  [ROLES.RISK_ANALYSIS]: buildRisksPrompt,
};

async function runRole({ assessmentId, role, intakeData }) {
  const prompt = promptBuilders[role](intakeData);
  const { generate } = getProvider(role);
  const providerName = resolveProviderName(role);

  const run = await prisma.assessmentRun.create({
    data: {
      assessmentId,
      provider: providerName,
      model: providerName === 'mock' ? 'mock-v1' : providerName,
      role,
      promptVersion: PROMPT_VERSION,
      status: 'running',
      inputData: { role, promptVersion: PROMPT_VERSION },
    },
  });

  try {
    const result = await withRetry(() =>
      generate({ role, prompt, intakeData }),
    );

    const status = result.status === 'completed' ? 'completed' : 'failed';
    await prisma.assessmentRun.update({
      where: { id: run.id },
      data: {
        provider: result.provider || providerName,
        model: result.model || run.model,
        promptVersion: result.promptVersion || PROMPT_VERSION,
        status,
        outputData: result.outputData ?? undefined,
        errorMessage: result.errorMessage || null,
        latencyMs: result.latencyMs ?? null,
      },
    });

    return {
      role,
      status,
      outputData: result.outputData,
    };
  } catch (error) {
    logger.error(`Assessment run failed for role ${role}: ${error.message}`);
    await prisma.assessmentRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });
    return { role, status: 'failed', outputData: null };
  }
}

export async function runAssessment({ assessmentId, intakeData }) {
  const results = await Promise.all(
    ROLE_LIST.map((role) => runRole({ assessmentId, role, intakeData })),
  );

  const succeeded = results.filter((item) => item.status === 'completed');
  const finalReport = reconcile(succeeded.map((item) => item.outputData));
  const status = succeeded.length === 0 ? 'failed' : 'completed';

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      status,
      finalReport: status === 'completed' ? finalReport : undefined,
    },
  });

  return { status, finalReport: status === 'completed' ? finalReport : null, results };
}
