const emptyReport = () => ({
  mvpRealityCheck: { narrative: '' },
  outcomeThatMatters: { metric: '', why: '' },
  personas: [],
  betaScope: [],
  notToBuild: [],
  techStack: {
    frontend: '',
    backend: '',
    payments: '',
    hosting: '',
    rationale: '',
  },
  investmentTimeline: { range: '', weeks: '', reasoning: '' },
  risks: {
    market: { risk: '', mitigation: '' },
    operational: { risk: '', mitigation: '' },
    financial: { risk: '', mitigation: '' },
  },
  visualArchitecture: { userFlow: [], informationArchitecture: [] },
  validationQuestions: [],
});

const pick = (value, fallback) =>
  value === undefined || value === null ? fallback : value;

/**
 * Merge role outputs into one report. Later roles do not overwrite
 * a section that an earlier successful role already filled with content.
 */
export function reconcile(roleOutputs = []) {
  const report = emptyReport();

  for (const output of roleOutputs) {
    if (!output || typeof output !== 'object') continue;

    if (output.mvpRealityCheck?.narrative && !report.mvpRealityCheck.narrative) {
      report.mvpRealityCheck = { narrative: output.mvpRealityCheck.narrative };
    }

    if (output.outcomeThatMatters?.metric && !report.outcomeThatMatters.metric) {
      report.outcomeThatMatters = {
        metric: output.outcomeThatMatters.metric,
        why: pick(output.outcomeThatMatters.why, ''),
      };
    }

    if (Array.isArray(output.personas) && output.personas.length && !report.personas.length) {
      report.personas = output.personas;
    }

    if (Array.isArray(output.betaScope) && output.betaScope.length && !report.betaScope.length) {
      report.betaScope = output.betaScope;
    }

    if (Array.isArray(output.notToBuild) && output.notToBuild.length && !report.notToBuild.length) {
      report.notToBuild = output.notToBuild;
    }

    if (output.techStack?.frontend && !report.techStack.frontend) {
      report.techStack = {
        frontend: pick(output.techStack.frontend, ''),
        backend: pick(output.techStack.backend, ''),
        payments: pick(output.techStack.payments, ''),
        hosting: pick(output.techStack.hosting, ''),
        rationale: pick(output.techStack.rationale, ''),
      };
    }

    if (output.investmentTimeline?.weeks && !report.investmentTimeline.weeks) {
      report.investmentTimeline = {
        range: pick(output.investmentTimeline.range, ''),
        weeks: pick(output.investmentTimeline.weeks, ''),
        reasoning: pick(output.investmentTimeline.reasoning, ''),
      };
    }

    if (output.risks?.market?.risk && !report.risks.market.risk) {
      report.risks = {
        market: {
          risk: pick(output.risks.market?.risk, ''),
          mitigation: pick(output.risks.market?.mitigation, ''),
        },
        operational: {
          risk: pick(output.risks.operational?.risk, ''),
          mitigation: pick(output.risks.operational?.mitigation, ''),
        },
        financial: {
          risk: pick(output.risks.financial?.risk, ''),
          mitigation: pick(output.risks.financial?.mitigation, ''),
        },
      };
    }

    if (
      Array.isArray(output.visualArchitecture?.userFlow) &&
      output.visualArchitecture.userFlow.length &&
      !report.visualArchitecture.userFlow.length
    ) {
      report.visualArchitecture = {
        userFlow: output.visualArchitecture.userFlow,
        informationArchitecture: Array.isArray(
          output.visualArchitecture.informationArchitecture,
        )
          ? output.visualArchitecture.informationArchitecture
          : [],
      };
    }

    if (
      Array.isArray(output.validationQuestions) &&
      output.validationQuestions.length &&
      !report.validationQuestions.length
    ) {
      report.validationQuestions = output.validationQuestions;
    }
  }

  return report;
}
