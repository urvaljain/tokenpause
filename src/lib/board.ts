/**
 * Turns decision-room answers into the "Before You Pay" board.
 *
 * Everything here is deterministic and framed as discussion material: the board
 * never scores, grades or concludes anything about a property or a transaction.
 */

import { getStep, labelFor, labelsFor, type Answers } from '../data/flow';

/* ------------------------------------------------------------------ *
 * 1. What you already have
 * ------------------------------------------------------------------ */

/** Compact wording used on evidence cards and in the copyable summary. */
const SHORT_DETAIL_LABELS: Record<string, string> = {
  identifier: 'Survey / gat / CTS identifier',
  seller_details: 'Seller or current-owner details',
  latest_record: 'Latest record or property document',
  deed_reference: 'Sale deed or registration reference',
  token_amount: 'Proposed token amount',
};

export type Evidence = {
  items: string[];
  /** True when there is enough on hand to organise a conversation around. */
  hasMaterial: boolean;
  message: string;
};

const SPARSE_EVIDENCE_MESSAGE =
  'You have a starting point—not a complete picture. Begin by collecting the basic property identifier and documents already available.';

const EVIDENCE_MESSAGE =
  'Keep these together for your next conversation, so every question points at a specific document.';

export function deriveEvidence(answers: Answers): Evidence {
  // Listed in question order rather than click order, so the board stays stable.
  const items = getStep('details')
    .options.filter((option) => option.id !== 'nothing' && answers.details.includes(option.id))
    .map((option) => SHORT_DETAIL_LABELS[option.id] ?? option.label);
  const hasMaterial = items.length >= 2;
  return {
    items,
    hasMaterial,
    message: hasMaterial ? EVIDENCE_MESSAGE : SPARSE_EVIDENCE_MESSAGE,
  };
}

/* ------------------------------------------------------------------ *
 * 2. Questions to ask next
 * ------------------------------------------------------------------ */

export type BoardQuestion = {
  id: string;
  text: string;
  /** Why this question is on the list, shown as supporting context. */
  reason: string;
};

type Candidate<T> = { value: T; score: number };

function rank<T>(candidates: Candidate<T>[], min: number, max: number): T[] {
  const chosen = candidates
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.value);
  if (chosen.length >= min) return chosen.slice(0, max);
  // Top up from the remaining candidates so the board is never thin.
  const remaining = candidates
    .filter((candidate) => candidate.score <= 0)
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.value);
  return [...chosen, ...remaining].slice(0, Math.max(min, Math.min(max, candidates.length)));
}

const urgentTiming = (answers: Answers) =>
  answers.timing === 'today' || answers.timing === 'days_2_3';

export function deriveQuestions(answers: Answers): BoardQuestion[] {
  const has = (id: string) => answers.details.includes(id);
  const shown = (id: string) => answers.shared.includes(id);

  const candidates: Candidate<BoardQuestion>[] = [
    {
      value: {
        id: 'recent_record',
        text: 'Can you share the most recent record you are relying on, and when it was issued?',
        reason: 'A record describes a moment in time, so its date matters as much as its contents.',
      },
      score: 6 + (has('latest_record') ? 0 : 2) + (answers.clarity === 'documents' ? 2 : 0),
    },
    {
      value: {
        id: 'right_to_sell',
        text: 'What document supports the seller’s right to sell this property?',
        reason: 'You mentioned ownership history is one of the things you want to understand.',
      },
      score:
        5 +
        (answers.clarity === 'ownership' ? 3 : 0) +
        (has('deed_reference') ? 0 : 2) +
        (shown('verbal') ? 2 : 0),
    },
    {
      value: {
        id: 'recent_changes',
        text: 'Are there recent changes, transfers, or claims that should be explained?',
        reason: 'Anything that changed recently is usually worth asking about explicitly.',
      },
      score: 4 + (answers.clarity === 'ownership' ? 2 : 0) + (shown('record') ? 1 : 0),
    },
    {
      value: {
        id: 'loan_status',
        text: 'If a loan or restriction was mentioned, what document shows its current status?',
        reason: 'A loan-clearance claim was described to you, so it is worth tying to a document.',
      },
      score: shown('loan_claim') ? 9 : answers.clarity === 'loans' ? 8 : 1,
    },
    {
      value: {
        id: 'independent_review',
        text: 'Can I take time to have the documents independently reviewed before paying a token?',
        reason: 'Asking for review time is a normal, reasonable request in a property conversation.',
      },
      score:
        3 +
        (urgentTiming(answers) ? 5 : 0) +
        (answers.urgency === 'broker_token' || answers.urgency === 'other_buyers' ? 2 : 0) +
        (answers.clarity === 'slow_down' ? 3 : 0),
    },
    {
      value: {
        id: 'who_agrees',
        text: 'Who else needs to agree before this transaction can move forward?',
        reason: 'More than one person is part of this decision, on your side or the seller’s.',
      },
      score:
        1 +
        (answers.urgency === 'family_push' ? 5 : 0) +
        (answers.audience === 'family' ? 3 : 0) +
        (answers.audience === 'other' ? 2 : 0),
    },
    {
      value: {
        id: 'identifier',
        text: 'Which exact plot, survey, gat, or CTS identifier does this property refer to?',
        reason: 'Without a precise identifier, later questions can be answered about a different plot.',
      },
      score: has('identifier') ? 0 : 7,
    },
    {
      value: {
        id: 'token_terms',
        text: 'What are the written terms of the token amount, and what happens to it if the sale does not proceed?',
        reason: 'A token payment has terms, and those terms are easier to discuss before paying.',
      },
      score:
        2 + (has('token_amount') ? 4 : 0) + (answers.urgency === 'broker_token' ? 4 : 0),
    },
    {
      value: {
        id: 'document_meaning',
        text: 'Which of these documents answers my question, and which parts still need explanation?',
        reason: 'So far the explanation has been mostly verbal or uncertain.',
      },
      score: shown('verbal') || shown('unsure') ? 6 : 0,
    },
    {
      value: {
        id: 'lawyer_scope',
        text: 'What should I ask an independent lawyer or advisor to look at first?',
        reason: 'You want to be prepared for a conversation with an independent professional.',
      },
      score:
        1 + (answers.clarity === 'lawyer_talk' ? 6 : 0) + (answers.audience === 'lawyer' ? 3 : 0),
    },
    {
      value: {
        id: 'compare_basis',
        text: 'For each property I am comparing, what exactly am I being asked to commit to?',
        reason: 'You are weighing more than one property, so the comparison needs the same facts for each.',
      },
      score: answers.urgency === 'comparing' ? 6 : 0,
    },
  ];

  return rank(candidates, 3, 5);
}

/* ------------------------------------------------------------------ *
 * 3. Suggested next actions
 * ------------------------------------------------------------------ */

export type BoardAction = {
  id: string;
  title: string;
  /** Expandable explanation of what the action means in practice. */
  detail: string;
};

export function deriveActions(answers: Answers): BoardAction[] {
  const sparse = answers.details.filter((id) => id !== 'nothing').length <= 1;

  const candidates: Candidate<BoardAction>[] = [
    {
      value: {
        id: 'gather',
        title: 'Gather the property identifier and documents already available.',
        detail:
          'Put everything you have in one place — the identifier, any record or deed copy, messages about the token amount. A single folder, physical or digital, makes the next conversation much shorter, and makes it obvious what is missing.',
      },
      score: 5 + (sparse ? 5 : 0),
    },
    {
      value: {
        id: 'support_claims',
        title: 'Ask for the key claims to be supported with relevant documents.',
        detail:
          'Write down each claim you have been told — about ownership, about a loan being cleared, about who can sign — and next to it, the document that would support it. Then ask for those documents specifically rather than asking for "the papers".',
      },
      score:
        6 +
        (answers.shared.includes('verbal') ? 3 : 0) +
        (answers.shared.includes('loan_claim') ? 2 : 0) +
        (answers.clarity === 'documents' || answers.clarity === 'ownership' ? 2 : 0),
    },
    {
      value: {
        id: 'written_note',
        title: 'Keep a written note of what was promised and by whom.',
        detail:
          'After each call or visit, note the date, who you spoke to, and what they committed to. You are not building a case — you are making sure that a week from now, you and your family remember the same version of the conversation.',
      },
      score: 4 + (answers.shared.includes('verbal') ? 3 : 0) + (urgentTiming(answers) ? 2 : 0),
    },
    {
      value: {
        id: 'share_summary',
        title: 'Share the summary with a family member, co-buyer, or independent advisor.',
        detail:
          'Copy your decision summary and take it to the people who are part of this decision. Reading the same list together tends to surface the question nobody had thought to ask yet.',
      },
      score:
        3 +
        (answers.audience === 'family' ? 4 : 0) +
        (answers.audience === 'lawyer' ? 3 : 0) +
        (answers.audience === 'other' ? 2 : 0) +
        (answers.urgency === 'family_push' ? 3 : 0),
    },
    {
      value: {
        id: 'professional_review',
        title: 'Decide what needs independent professional review before money changes hands.',
        detail:
          'TokenPause cannot tell you whether a document is in order — that is work for an independent qualified property lawyer or another appropriate professional. Decide now which documents you want reviewed, so the request does not become an afterthought once a payment is due.',
      },
      score:
        5 +
        (urgentTiming(answers) ? 3 : 0) +
        (answers.clarity === 'lawyer_talk' ? 3 : 0) +
        (answers.clarity === 'loans' ? 2 : 0),
    },
    {
      value: {
        id: 'slow_down_script',
        title: 'Prepare one sentence that asks for time without walking away.',
        detail:
          'Something like: "I am serious about this property. I need to organise the documents for independent review before I pay anything." Deciding the wording in advance makes it much easier to say on the call.',
      },
      score:
        1 +
        (answers.clarity === 'slow_down' ? 6 : 0) +
        (answers.timing === 'today' ? 3 : 0) +
        (answers.urgency === 'other_buyers' ? 2 : 0),
    },
  ];

  return rank(candidates, 3, 4);
}

/* ------------------------------------------------------------------ *
 * 4. Pressure check
 * ------------------------------------------------------------------ */

export type PressureCheck = {
  timingLabel: string;
  body: string;
};

const PRESSURE_BODY: Record<string, string> = {
  today:
    'A short deadline can make it harder to organise questions. Before transferring money, make sure you understand what you are agreeing to and what still needs independent review.',
  days_2_3:
    'Two or three days is enough time to collect documents and ask for an explanation in writing. Use it for the questions above rather than for the decision itself.',
  this_week:
    'A week is room to work with. Getting the documents and the questions in order early leaves time for someone independent to look at them.',
  no_deadline:
    'With no deadline in play, this is the easiest moment to organise everything calmly. If a deadline appears later, you will already know what you have and what you asked for.',
};

export function derivePressure(answers: Answers): PressureCheck {
  const timingLabel = labelFor('timing', answers.timing) ?? 'Not specified';
  const body =
    (answers.timing ? PRESSURE_BODY[answers.timing] : undefined) ??
    'You have not set a decision date. Before transferring money, make sure you understand what you are agreeing to and what still needs independent review.';
  return { timingLabel, body };
}

/* ------------------------------------------------------------------ *
 * 5. Copyable decision summary
 * ------------------------------------------------------------------ */

const TIMING_SENTENCE: Record<string, string> = {
  today: 'A token decision is being requested today.',
  days_2_3: 'A token decision is being requested within the next two to three days.',
  this_week: 'A token decision is being requested this week.',
  no_deadline: 'No decision deadline has been set yet.',
};

const CLARITY_NEEDS: Record<string, string[]> = {
  documents: [
    'Which documents I should be asking for, and in what order',
    'Whether what I have already been shown is the most recent version',
  ],
  ownership: [
    'What supports the seller’s right to sell this property',
    'Whether recent changes or transfers need explanation',
  ],
  loans: [
    'The current status of any loan, claim, or restriction that was mentioned',
    'Which document would show that status',
  ],
  slow_down: [
    'How to ask for review time without ending the conversation',
    'What I want reviewed before any money moves',
  ],
  lawyer_talk: [
    'What to put in front of an independent lawyer or advisor first',
    'Which documents they would need from me',
  ],
  unsure: [
    'Which questions matter most at this stage',
    'What should be independently reviewed before payment',
  ],
};

const AUDIENCE_LINE: Record<string, string> = {
  me: 'Prepared for my own reference.',
  family: 'Prepared to discuss with a family member or co-buyer.',
  lawyer: 'Prepared to discuss with an independent lawyer or advisor.',
  broker: 'Prepared for the next conversation with the broker or seller.',
  other: 'Prepared to discuss with someone else involved in this decision.',
};

export type SummaryInput = {
  answers: Answers;
  actions: BoardAction[];
  completedActionIds: string[];
  note: string;
  isSample: boolean;
};

/** Builds the plain-text summary shown in, and copied from, the summary panel. */
export function buildSummary({
  answers,
  actions,
  completedActionIds,
  note,
  isSample,
}: SummaryInput): string {
  const lines: string[] = [];

  lines.push('TOKENPAUSE DECISION SUMMARY');
  lines.push('Generated for discussion only — not legal advice');
  if (isSample) lines.push('FICTIONAL SAMPLE — not a real property or transaction');
  lines.push('');

  lines.push('Current timing:');
  lines.push((answers.timing ? TIMING_SENTENCE[answers.timing] : undefined) ?? 'No timing recorded.');
  lines.push('');

  const evidence = deriveEvidence(answers);
  lines.push('What I have:');
  if (evidence.items.length > 0) {
    for (const item of evidence.items) lines.push(`• ${item}`);
  } else {
    lines.push('• Nothing collected yet — this is the starting point.');
  }
  lines.push('');

  lines.push('What I still need to clarify:');
  const needs = (answers.clarity ? CLARITY_NEEDS[answers.clarity] : undefined) ?? CLARITY_NEEDS.unsure;
  for (const need of needs) lines.push(`• ${need}`);
  if (answers.shared.includes('verbal') || answers.shared.includes('unsure')) {
    lines.push('• Written support for anything that has only been explained verbally');
  }
  lines.push('');

  lines.push('Questions I am taking into the next conversation:');
  deriveQuestions(answers).forEach((question, index) => {
    lines.push(`${index + 1}. ${question.text}`);
  });
  lines.push('');

  lines.push('My next actions:');
  actions.forEach((action, index) => {
    const mark = completedActionIds.includes(action.id) ? ' [done]' : '';
    lines.push(`${index + 1}. ${action.title}${mark}`);
  });

  if (note.trim().length > 0) {
    lines.push('');
    lines.push('My note:');
    lines.push(note.trim());
  }

  lines.push('');
  lines.push((answers.audience ? AUDIENCE_LINE[answers.audience] : undefined) ?? AUDIENCE_LINE.me);
  lines.push('');
  lines.push(
    'TokenPause is an educational decision-support prototype. It does not verify a property, provide legal advice, or replace independent professional review.',
  );

  return lines.join('\n');
}

/** Selected answers, flattened for display on the board header. */
export function describeSituation(answers: Answers): string[] {
  const parts: string[] = [];
  const urgency = labelFor('urgency', answers.urgency);
  if (urgency) parts.push(urgency);
  const shared = labelsFor('shared', answers.shared);
  if (shared.length > 0) parts.push(`Shown so far: ${shared.join(', ').toLowerCase()}`);
  return parts;
}
