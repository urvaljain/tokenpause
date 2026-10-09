/**
 * The six questions of the decision room.
 *
 * Content lives here so the flow component stays a thin renderer and the board
 * logic can reference option ids rather than copy.
 */

export type StepId = 'urgency' | 'details' | 'shared' | 'audience' | 'clarity' | 'timing';

export type Option = {
  id: string;
  label: string;
  /** Marks an "I have nothing / I am not sure" option in a multi-select step. */
  exclusive?: boolean;
};

export type Step = {
  id: StepId;
  /** 1-based position, shown in the progress indicator. */
  number: number;
  eyebrow: string;
  question: string;
  helper?: string;
  kind: 'single' | 'multi';
  options: Option[];
};

export const STEPS: Step[] = [
  {
    id: 'urgency',
    number: 1,
    eyebrow: 'The immediate situation',
    question: 'What is creating urgency today?',
    helper: 'Pick the closest description. There is no wrong answer here.',
    kind: 'single',
    options: [
      { id: 'broker_token', label: 'The broker asked for a token amount.' },
      { id: 'other_buyers', label: 'The seller says other buyers are interested.' },
      { id: 'family_push', label: 'A family member wants a quick decision.' },
      { id: 'comparing', label: 'I am comparing more than one property.' },
      { id: 'exploring', label: 'I am still exploring.' },
    ],
  },
  {
    id: 'details',
    number: 2,
    eyebrow: 'What you have',
    question: 'Which details do you already have?',
    helper: 'Having a document is different from understanding what it means.',
    kind: 'multi',
    options: [
      { id: 'identifier', label: 'Plot, survey, gat, or CTS identifier' },
      { id: 'seller_details', label: 'Seller or current-owner details' },
      { id: 'latest_record', label: 'Latest record or property document' },
      { id: 'deed_reference', label: 'Sale deed or registration reference' },
      { id: 'token_amount', label: 'Proposed token amount' },
      { id: 'nothing', label: 'Nothing collected yet', exclusive: true },
    ],
  },
  {
    id: 'shared',
    number: 3,
    eyebrow: 'What has been shared',
    question: 'What has the seller or broker shown you so far?',
    helper: 'Select everything that has been shown or described to you.',
    kind: 'multi',
    options: [
      { id: 'record', label: 'A property record' },
      { id: 'deed_copy', label: 'A copy of a deed' },
      { id: 'verbal', label: 'A verbal explanation only' },
      { id: 'map', label: 'A map or location pin' },
      { id: 'loan_claim', label: 'A loan-clearance claim' },
      { id: 'unsure', label: 'I am not sure', exclusive: true },
    ],
  },
  {
    id: 'audience',
    number: 4,
    eyebrow: 'Who is involved',
    question: 'Who should be able to see the next-step summary?',
    helper:
      'This only personalises the wording of your summary on this device. TokenPause never asks for names or contact details.',
    kind: 'single',
    options: [
      { id: 'me', label: 'Me only' },
      { id: 'family', label: 'Family member or co-buyer' },
      { id: 'lawyer', label: 'Independent lawyer or advisor' },
      { id: 'broker', label: 'Broker or seller' },
      { id: 'other', label: 'Other' },
    ],
  },
  {
    id: 'clarity',
    number: 5,
    eyebrow: 'What needs clarity',
    question: 'What would make you feel better prepared for the next conversation?',
    helper: '"I am not sure yet" is a valid answer — the board adapts either way.',
    kind: 'single',
    options: [
      { id: 'documents', label: 'Which documents to ask for' },
      { id: 'ownership', label: 'Questions about ownership history' },
      { id: 'loans', label: 'Questions about loans, claims, or restrictions' },
      { id: 'slow_down', label: 'How to slow down the decision respectfully' },
      { id: 'lawyer_talk', label: 'What to discuss with an independent lawyer' },
      { id: 'unsure', label: 'I am not sure yet' },
    ],
  },
  {
    id: 'timing',
    number: 6,
    eyebrow: 'Decision timing',
    question: 'When are you being asked to decide?',
    kind: 'single',
    options: [
      { id: 'today', label: 'Today' },
      { id: 'days_2_3', label: 'Within 2–3 days' },
      { id: 'this_week', label: 'This week' },
      { id: 'no_deadline', label: 'No deadline yet' },
    ],
  },
];

export const TOTAL_STEPS = STEPS.length;

export type Answers = {
  urgency: string | null;
  details: string[];
  shared: string[];
  audience: string | null;
  clarity: string | null;
  timing: string | null;
};

export const EMPTY_ANSWERS: Answers = {
  urgency: null,
  details: [],
  shared: [],
  audience: null,
  clarity: null,
  timing: null,
};

/** Entirely fictional scenario used by the "sample decision room" path. */
export const SAMPLE_ANSWERS: Answers = {
  urgency: 'broker_token',
  details: ['identifier', 'latest_record', 'token_amount'],
  shared: ['record', 'verbal', 'loan_claim'],
  audience: 'lawyer',
  clarity: 'loans',
  timing: 'days_2_3',
};

export const SAMPLE_SCENARIO = `Example only:
A buyer is asked to pay a token within two days.
They have a plot identifier and a recent record, but only a verbal explanation about a prior loan.
They want to discuss next steps with a family member and independent lawyer.`;

export const SAMPLE_NOTICE =
  'This sample is fictional. It does not describe a real property or transaction.';

const STEP_BY_ID = new Map(STEPS.map((step) => [step.id, step]));

export function getStep(id: StepId): Step {
  const step = STEP_BY_ID.get(id);
  if (!step) throw new Error(`Unknown step: ${id}`);
  return step;
}

/** Human-readable label for a single option id. */
export function labelFor(stepId: StepId, optionId: string | null): string | null {
  if (!optionId) return null;
  return getStep(stepId).options.find((option) => option.id === optionId)?.label ?? null;
}

/** Human-readable labels for a multi-select answer, in question order. */
export function labelsFor(stepId: StepId, optionIds: string[]): string[] {
  return getStep(stepId)
    .options.filter((option) => optionIds.includes(option.id))
    .map((option) => option.label);
}
