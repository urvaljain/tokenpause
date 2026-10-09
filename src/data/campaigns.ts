/**
 * Content-to-product campaign concepts.
 *
 * These are planned concepts for a portfolio exercise. Nothing here has been
 * published, and no views, reach or results are claimed.
 */

import type { Source } from '../lib/analytics';

export type CampaignJourney = 'decision-room' | 'sample' | 'summary';

export type Campaign = {
  id: string;
  source: Extract<Source, 'reel_1' | 'reel_2' | 'reel_3'>;
  label: string;
  title: string;
  audience: string;
  hook: string;
  format: string;
  storyboard: string[];
  cta: string;
  intendedEvent: string;
  learningQuestion: string;
  /** Where "Preview journey" sends the visitor inside the product. */
  journey: CampaignJourney;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'reel_1',
    source: 'reel_1',
    label: 'Reel 1',
    title: 'The broker wants a token today',
    audience:
      'First-time buyers in metro and tier-2 cities who have just been asked for a token amount.',
    hook: 'Before you pay a token, ask yourself these three questions.',
    format: 'Vertical short-form video, 30–40 seconds, on-screen text with a calm voice-over.',
    storyboard: [
      'The broker says another buyer is ready.',
      'You feel pressure to send the token.',
      'Pause: What do you actually know?',
      'Use TokenPause to organise your next conversation.',
    ],
    cta: 'Build your Before You Pay Board',
    intendedEvent: 'decision_room_started',
    learningQuestion: 'Does pressure-based content create high-intent decision-room starts?',
    journey: 'decision-room',
  },
  {
    id: 'reel_2',
    source: 'reel_2',
    label: 'Reel 2',
    title: 'A document is not the same as clarity',
    audience:
      'Buyers who have already received a record or deed copy and assume the paperwork settles it.',
    hook: 'Having a property document does not automatically answer every question.',
    format: 'Vertical short-form video, 35–45 seconds, document close-ups with annotated questions.',
    storyboard: [
      'You received a document.',
      'But what does it support—and what still needs explanation?',
      'Organise the questions before you make a commitment.',
      'Pause before you pay.',
    ],
    cta: 'See the sample decision room',
    intendedEvent: 'sample_decision_room_opened',
    learningQuestion: 'Does document-education content increase completed action boards?',
    journey: 'sample',
  },
  {
    id: 'reel_3',
    source: 'reel_3',
    label: 'Reel 3',
    title: 'How to slow down without losing the deal',
    audience:
      'Buyers who want more time but are worried that asking for it will cost them the property.',
    hook: 'You can ask for time without sounding uninterested.',
    format: 'Vertical short-form video, 25–35 seconds, script-on-screen format built to be saved.',
    storyboard: [
      'Instead of saying no…',
      'Say: “I’m serious about this. I need to organise the documents for review before payment.”',
      'Prepare the questions before the next call.',
      'TokenPause.',
    ],
    cta: 'Prepare my summary',
    intendedEvent: 'decision_summary_copied',
    learningQuestion: 'Does a script-based reassurance hook increase summary-copy actions?',
    journey: 'summary',
  },
];
