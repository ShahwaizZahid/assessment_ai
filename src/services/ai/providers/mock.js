import { ROLES } from '../roles.js';

const appNameFrom = (intakeData) =>
  intakeData?.idea?.appName?.trim() || 'this product';

const platformsFrom = (intakeData) => {
  const platforms = intakeData?.features?.platform;
  if (Array.isArray(platforms) && platforms.length) return platforms.join(', ');
  return 'web';
};

const primaryUserFrom = (intakeData) =>
  intakeData?.users?.primaryUser?.trim() || 'the primary user';

function realityCheck(intakeData) {
  const name = appNameFrom(intakeData);
  const problem = intakeData?.problem?.problem || 'an unclear problem';
  const primary = primaryUserFrom(intakeData);

  return {
    mvpRealityCheck: {
      narrative: `${name} is trying to solve "${problem}". That is a real daily friction, but the first version will fail if it tries to be a full kitchen OS. Ship a narrow loop: capture what is in the pantry, suggest one cookable meal, and make that meal easy to follow. Anything else is a later product.`,
    },
    outcomeThatMatters: {
      metric: 'A first-time user cooks one suggested meal from pantry items within 7 days of signup.',
      why: 'If people do not cook from the app, pantry tracking and grocery suggestions never compound.',
    },
    personas: [
      {
        name: 'Home cook (primary)',
        needs: primary,
        cutAndWhy:
          'Do not build chef-level meal planning in beta. They need one good dinner tonight, not a 30-day calendar.',
      },
      {
        name: 'Secondary household helper',
        needs: intakeData?.users?.secondaryUsers || 'Occasional helpers in the kitchen',
        cutAndWhy:
          'Skip multi-role permissions and kitchen-manager dashboards. One shared household pantry is enough for V1.',
      },
    ],
  };
}

function featureScope(intakeData) {
  const core = intakeData?.features?.coreFeatures || 'core pantry and recipe flows';
  const nice = intakeData?.features?.niceToHave || 'social sharing';

  return {
    betaScope: [
      {
        item: 'Pantry inventory (add/edit/remove items)',
        rationale: `Supports the stated core: ${core}`,
      },
      {
        item: 'Recipe suggestions from current pantry items',
        rationale: 'This is the unique loop. Without it the app is a notes list.',
      },
      {
        item: 'Step-by-step cook mode for one recipe',
        rationale: 'Closes the outcome metric: the user actually cooks.',
      },
      {
        item: 'Simple grocery gap list',
        rationale: 'Turns missing ingredients into the next action without a full shopping product.',
      },
    ],
    notToBuild: [
      {
        item: nice || 'Social sharing of cooked meals',
        phase: 'V2',
        reason: 'Social loops need a cooked-meal habit first. They inflate scope and moderation cost.',
      },
      {
        item: 'Marketplace / grocery delivery checkout',
        phase: 'V3',
        reason: 'Payments, partners, and ops are a different company. Keep a list, not a store.',
      },
    ],
  };
}

function technical(intakeData) {
  const name = appNameFrom(intakeData);
  const platforms = platformsFrom(intakeData);
  const wantsMobile = /ios|android|mobile/i.test(platforms);
  const frontend = wantsMobile
    ? 'React Native (or Flutter) + a thin web admin later'
    : 'React web app';

  return {
    techStack: {
      frontend,
      backend: 'Node.js (Express) + PostgreSQL',
      payments: 'None in beta. Add Stripe only if subscriptions become the paid wedge.',
      hosting: 'A single cloud (Railway/Render/Fly) for API + managed Postgres',
      rationale: `${name} is content + CRUD, not real-time video. ${platforms} can share one API. Avoid microservices.`,
    },
    investmentTimeline: {
      range: intakeData?.business?.budgetRange || 'Not sure',
      weeks: '8–12 weeks for a constrained beta (one platform first if budget is unclear)',
      reasoning:
        intakeData?.business?.devTeamStatus ||
        'With an agency or small team, 8–12 weeks is realistic if social, marketplace, and multi-kitchen features stay out.',
    },
    visualArchitecture: {
      userFlow: [
        'Open app / sign up',
        'Add pantry items (manual or photo later)',
        'See 1–3 recipes that match the pantry',
        'Open cook mode and complete a meal',
        'Mark items used; optionally add missing groceries to a list',
      ],
      informationArchitecture: [
        'Home (suggested meals)',
        'Pantry',
        'Recipe detail + cook mode',
        'Grocery gaps',
        'Settings',
      ],
    },
  };
}

function riskAnalysis(intakeData) {
  const name = appNameFrom(intakeData);

  return {
    risks: {
      market: {
        risk: `Recipe apps are crowded. ${name} can look like "another recipe site" if pantry matching is weak.`,
        mitigation: 'Measure pantry-to-cook conversion, not downloads. Lead with the matching loop in every screen.',
      },
      operational: {
        risk: 'Recipe quality and food-safety content do not scale if everything is hand-written.',
        mitigation: 'Start with a small curated recipe set that maps to common pantry staples. Do not scrape the internet in V1.',
      },
      financial: {
        risk: `Revenue model (${(intakeData?.business?.revenueModels || []).join(', ') || 'unclear'}) may not attach until habit exists.`,
        mitigation: 'Ship free beta. Charge later for household sharing or premium recipe packs, not before cook-repeat is proven.',
      },
    },
    validationQuestions: [
      'Will 10 target users add their real pantry and cook from a suggestion this week?',
      'Do they already use YouTube/TikTok for recipes — why would they switch?',
      'Which one platform will you launch first if budget stays "not sure"?',
      'What pantry size is typical (10 items vs 80), and does matching still work?',
    ],
  };
}

const builders = {
  [ROLES.REALITY_CHECK]: realityCheck,
  [ROLES.FEATURE_SCOPE]: featureScope,
  [ROLES.TECHNICAL]: technical,
  [ROLES.RISK_ANALYSIS]: riskAnalysis,
};

export async function generate({ role, prompt, intakeData }) {
  const started = Date.now();
  const build = builders[role];
  if (!build) {
    return {
      provider: 'mock',
      model: 'mock-v1',
      role,
      promptVersion: prompt?.version || 'v1',
      status: 'failed',
      outputData: null,
      errorMessage: `Unknown role: ${role}`,
      latencyMs: Date.now() - started,
    };
  }

  return {
    provider: 'mock',
    model: 'mock-v1',
    role,
    promptVersion: prompt?.version || 'v1',
    status: 'completed',
    outputData: build(intakeData),
    errorMessage: null,
    latencyMs: Date.now() - started,
  };
}
