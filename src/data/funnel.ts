/**
 * Illustrative Growth Lab data.
 *
 * Every number in this file is made up for a portfolio exercise. It is not live
 * performance data, campaign results or customer data, and the UI labels it as
 * illustrative wherever it appears.
 */

export const ILLUSTRATIVE_LABEL =
  'Illustrative demo data — not live performance, campaign results, or customer data.';

export type FunnelStage = {
  id: string;
  stage: string;
  count: number;
  /** Conversion from the first stage, as a percentage. */
  fromVisit: number;
  definition: string;
};

export const FUNNEL: FunnelStage[] = [
  {
    id: 'visits',
    stage: 'Landing visits',
    count: 1000,
    fromVisit: 100,
    definition: 'Any visitor who reaches the TokenPause landing page.',
  },
  {
    id: 'content_visits',
    stage: 'Content-linked visits',
    count: 430,
    fromVisit: 43,
    definition: 'Visits attributed to a short-form content campaign rather than a direct visit.',
  },
  {
    id: 'rooms_started',
    stage: 'Decision rooms started',
    count: 310,
    fromVisit: 31,
    definition: 'Visitors who answer at least the first question of the guided flow.',
  },
  {
    id: 'boards_created',
    stage: 'Action boards created',
    count: 190,
    fromVisit: 19,
    definition: 'Visitors who complete the six questions and reach a Before You Pay board.',
  },
  {
    id: 'summaries_copied',
    stage: 'Summaries copied',
    count: 96,
    fromVisit: 9.6,
    definition: 'Visitors who copy the decision summary, the strongest signal of intent to discuss.',
  },
  {
    id: 'next_step_clicks',
    stage: 'Next-step exploration clicks',
    count: 72,
    fromVisit: 7.2,
    definition:
      'Visitors who explore what to do next after the board — reading guidance or revisiting actions.',
  },
];

/** 14 days of illustrative decision-room starts and completed boards. */
export type TrendPoint = { day: number; started: number; completed: number };

export const TREND: TrendPoint[] = [
  { day: 1, started: 12, completed: 6 },
  { day: 2, started: 15, completed: 8 },
  { day: 3, started: 14, completed: 7 },
  { day: 4, started: 21, completed: 12 },
  { day: 5, started: 26, completed: 15 },
  { day: 6, started: 24, completed: 16 },
  { day: 7, started: 19, completed: 11 },
  { day: 8, started: 23, completed: 14 },
  { day: 9, started: 28, completed: 18 },
  { day: 10, started: 31, completed: 19 },
  { day: 11, started: 27, completed: 17 },
  { day: 12, started: 22, completed: 14 },
  { day: 13, started: 25, completed: 16 },
  { day: 14, started: 29, completed: 19 },
];

export type ExperimentArm = {
  id: string;
  name: string;
  description: string;
  cta: string;
  primaryMetric: string;
  status: string;
};

export const EXPERIMENT: { hypothesisArms: ExperimentArm[]; learningStatement: string } = {
  hypothesisArms: [
    {
      id: 'control',
      name: 'Control',
      description:
        'Visitor lands on a single page and is asked to act immediately, with no structured questions in between.',
      cta: 'Pay token safely',
      primaryMetric: 'Action boards created per unique visitor',
      status: 'Not yet run — no results recorded',
    },
    {
      id: 'variant',
      name: 'Variant',
      description:
        'Visitor is taken through the six-question decision room and lands on a personalised Before You Pay board.',
      cta: 'TokenPause decision-room journey',
      primaryMetric: 'Action boards created per unique visitor',
      status: 'Not yet run — no results recorded',
    },
  ],
  learningStatement:
    'The experiment tests whether helping people organise uncertainty before asking for a next step creates more meaningful engagement than a direct CTA.',
};

export const METRICS = {
  primary: {
    name: 'Action boards created per unique visitor',
    definition:
      'Completed Before You Pay boards divided by unique landing visitors. Chosen because it is the first point at which a visitor has done real thinking work, not just clicked.',
    illustrative: '0.19',
  },
  supporting: [
    {
      name: 'Decision-room start rate',
      definition: 'Decision rooms started ÷ landing visits.',
      illustrative: '31%',
    },
    {
      name: 'Summary-copy rate',
      definition: 'Summaries copied ÷ action boards created.',
      illustrative: '51%',
    },
    {
      name: 'Next-step exploration rate',
      definition: 'Next-step exploration clicks ÷ action boards created.',
      illustrative: '38%',
    },
  ],
};

export const ANALYTICS_NOTE =
  'In a production product, these events could be sent to tools such as PostHog, Mixpanel, Amplitude, or GA4. This prototype keeps all interaction data in the user’s browser.';
