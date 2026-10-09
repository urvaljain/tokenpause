/**
 * Browser-local prototype analytics.
 *
 * Every meaningful interaction in TokenPause is recorded here as a flat event.
 * Nothing leaves the browser: events are kept in localStorage (with an
 * in-memory fallback) so the Growth Lab can show the current session's real
 * behaviour next to the illustrative demo funnel.
 *
 * In a production product these events could be forwarded to tools such as
 * PostHog, Mixpanel, Amplitude or GA4.
 */

import { readJson, removeKey, storageIsPersistent, writeJson } from './storage';

export const EVENTS_KEY = 'tokenpause.analytics.events.v1';
const SESSION_KEY = 'tokenpause.analytics.session.v1';
const SOURCE_KEY = 'tokenpause.analytics.source.v1';

/** How the visitor arrived at (or re-entered) the product. */
export type Source = 'direct' | 'reel_1' | 'reel_2' | 'reel_3' | 'sample';

export type EventName =
  | 'landing_viewed'
  | 'campaign_section_viewed'
  | 'reel_card_opened'
  | 'reel_journey_started'
  | 'decision_room_started'
  | 'decision_step_viewed'
  | 'decision_answer_selected'
  | 'decision_room_completed'
  | 'action_board_viewed'
  | 'action_item_toggled'
  | 'decision_summary_viewed'
  | 'decision_summary_copied'
  | 'sample_decision_room_opened'
  | 'new_decision_room_started'
  | 'growth_lab_viewed'
  | 'local_demo_reset';

export type AnalyticsEvent = {
  event_name: EventName;
  timestamp: string;
  session_id: string;
  page_or_section: string;
  source?: Source;
  decision_timing?: string;
  selected_detail_count?: number;
  action_completion_count?: number;
  cta_label?: string;
};

/** Optional properties a caller may attach to an event. */
export type EventProps = Omit<AnalyticsEvent, 'event_name' | 'timestamp' | 'session_id'>;

const MAX_EVENTS = 400;

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function loadSessionId(): string {
  const existing = readJson<string | null>(SESSION_KEY, null);
  if (typeof existing === 'string' && existing.length > 0) return existing;
  const created = createId('sess');
  writeJson(SESSION_KEY, created);
  return created;
}

let sessionId = loadSessionId();
let events = readJson<AnalyticsEvent[]>(EVENTS_KEY, []);
let source = readJson<Source>(SOURCE_KEY, 'direct');

export type SessionSnapshot = {
  sessionId: string;
  source: Source;
  persistent: boolean;
  totalEvents: number;
  firstEventAt: string | null;
  lastEventAt: string | null;
  counts: Record<EventName, number>;
  actionsMarkedComplete: number;
  /** Copy events that actually reached the clipboard. */
  summariesCopied: number;
  recent: AnalyticsEvent[];
};

const EVENT_NAMES: EventName[] = [
  'landing_viewed',
  'campaign_section_viewed',
  'reel_card_opened',
  'reel_journey_started',
  'decision_room_started',
  'decision_step_viewed',
  'decision_answer_selected',
  'decision_room_completed',
  'action_board_viewed',
  'action_item_toggled',
  'decision_summary_viewed',
  'decision_summary_copied',
  'sample_decision_room_opened',
  'new_decision_room_started',
  'growth_lab_viewed',
  'local_demo_reset',
];

/** Label used on `action_item_toggled` when an action was checked on. */
export const ACTION_COMPLETED_LABEL = 'Marked complete';

/** Label used on `decision_summary_copied` when the copy did not go through. */
export const COPY_FAILED_LABEL = 'Copy summary (failed)';

function buildSnapshot(): SessionSnapshot {
  const counts = Object.fromEntries(EVENT_NAMES.map((name) => [name, 0])) as Record<
    EventName,
    number
  >;
  for (const event of events) {
    if (event.event_name in counts) counts[event.event_name] += 1;
  }
  return {
    sessionId,
    source,
    persistent: storageIsPersistent,
    totalEvents: events.length,
    firstEventAt: events[0]?.timestamp ?? null,
    lastEventAt: events[events.length - 1]?.timestamp ?? null,
    counts,
    actionsMarkedComplete: events.filter(
      (event) =>
        event.event_name === 'action_item_toggled' && event.cta_label === ACTION_COMPLETED_LABEL,
    ).length,
    summariesCopied: events.filter(
      (event) =>
        event.event_name === 'decision_summary_copied' && event.cta_label !== COPY_FAILED_LABEL,
    ).length,
    recent: events.slice(-8).reverse(),
  };
}

let snapshot: SessionSnapshot = buildSnapshot();
const listeners = new Set<() => void>();

function publish(): void {
  snapshot = buildSnapshot();
  for (const listener of listeners) listener();
}

/** Record one interaction. Safe to call from render effects. */
export function track(event_name: EventName, props: EventProps): void {
  const entry: AnalyticsEvent = {
    event_name,
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    source,
    ...props,
  };
  events = [...events, entry].slice(-MAX_EVENTS);
  writeJson(EVENTS_KEY, events);
  publish();
}

/** Attribute the visitor to a channel. Used by the campaign cards and sample. */
export function setSource(next: Source): void {
  if (source === next) return;
  source = next;
  writeJson(SOURCE_KEY, next);
  publish();
}

export function getSource(): Source {
  return source;
}

/** Clears browser-local analytics only. Illustrative demo data is static. */
export function resetAnalytics(): void {
  events = [];
  removeKey(EVENTS_KEY);
  sessionId = createId('sess');
  writeJson(SESSION_KEY, sessionId);
  source = 'direct';
  writeJson(SOURCE_KEY, source);
  publish();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function getSnapshot(): SessionSnapshot {
  return snapshot;
}
