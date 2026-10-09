import { useState } from 'react';
import {
  ANALYTICS_NOTE,
  EXPERIMENT,
  FUNNEL,
  METRICS,
  TREND,
} from '../data/funnel';
import type { DecisionRoom } from '../hooks/useDecisionRoom';
import { useAnalyticsSnapshot } from '../hooks/useAnalyticsSnapshot';
import { useSectionViewed } from '../hooks/useSectionViewed';
import type { EventName, SessionSnapshot } from '../lib/analytics';
import { IllustrativeNotice } from './ui/IllustrativeNotice';
import { TrendChart } from './ui/TrendChart';

type Props = {
  room: DecisionRoom;
};

type SessionStat = { label: string; value: (snapshot: SessionSnapshot) => number };

const countOf =
  (event: EventName) =>
  (snapshot: SessionSnapshot): number =>
    snapshot.counts[event];

const SESSION_STATS: SessionStat[] = [
  { label: 'Landing views', value: countOf('landing_viewed') },
  { label: 'Campaign card opens', value: countOf('reel_card_opened') },
  { label: 'Decision-room starts', value: countOf('decision_room_started') },
  { label: 'Decision-flow completions', value: countOf('decision_room_completed') },
  { label: 'Action board views', value: countOf('action_board_viewed') },
  { label: 'Actions marked complete', value: (snapshot) => snapshot.actionsMarkedComplete },
  { label: 'Summaries copied', value: (snapshot) => snapshot.summariesCopied },
  { label: 'New rooms started', value: countOf('new_decision_room_started') },
  { label: 'Growth Lab views', value: countOf('growth_lab_viewed') },
  { label: 'Events recorded in total', value: (snapshot) => snapshot.totalEvents },
];

const EVENT_SCHEMA = `{
  event_name: string,
  timestamp: string,
  session_id: string,
  page_or_section: string,
  source?: "direct" | "reel_1" | "reel_2" | "reel_3" | "sample",
  decision_timing?: string,
  selected_detail_count?: number,
  action_completion_count?: number,
  cta_label?: string
}`;

export function GrowthLab({ room }: Props) {
  const snapshot = useAnalyticsSnapshot();
  const sectionRef = useSectionViewed<HTMLElement>('growth_lab_viewed', {
    page_or_section: 'growth-lab',
  });
  const [confirmReset, setConfirmReset] = useState(false);

  const maxCount = FUNNEL[0].count;

  return (
    <section
      className="section"
      id="growth-lab"
      aria-labelledby="growth-title"
      tabIndex={-1}
      ref={sectionRef}
    >
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Measurement</p>
          <h2 className="section-title" id="growth-title">
            Growth Lab
          </h2>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--ink-soft)' }}>
            Illustrative acquisition-to-action funnel
          </h3>
          <p className="lede">
            Two kinds of data live here, and they are never mixed: made-up numbers that show how the
            funnel would be measured, and the real events your browser has recorded in this session.
          </p>
        </div>

        <div className="growth-grid">
          <div className="growth-column">
            {/* Funnel */}
            <section className="board-panel" aria-labelledby="funnel-title">
              <div className="panel-head">
                <span className="panel-number" aria-hidden="true">
                  01
                </span>
                <h3 id="funnel-title">Acquisition-to-action funnel</h3>
              </div>
              <IllustrativeNotice />
              <ul className="funnel" style={{ marginTop: 'var(--space-4)' }}>
                {FUNNEL.map((stage) => (
                  <li key={stage.id}>
                    <div className="funnel-row">
                      <span className="funnel-stage">{stage.stage}</span>
                      <span className="funnel-values">
                        <b>{stage.count.toLocaleString('en-US')}</b> · {stage.fromVisit}% of visits
                      </span>
                      <span className="funnel-bar">
                        <span
                          className="funnel-fill"
                          style={{ width: `${(stage.count / maxCount) * 100}%` }}
                        />
                      </span>
                      <p className="funnel-definition">{stage.definition}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Trend */}
            <section className="board-panel" aria-labelledby="trend-title">
              <div className="panel-head">
                <span className="panel-number" aria-hidden="true">
                  02
                </span>
                <h3 id="trend-title">14-day trend</h3>
              </div>
              <IllustrativeNotice />
              <div style={{ marginTop: 'var(--space-4)' }}>
                <TrendChart points={TREND} />
              </div>
            </section>

            {/* Experiment */}
            <section className="board-panel" aria-labelledby="experiment-title">
              <div className="panel-head">
                <span className="panel-number" aria-hidden="true">
                  03
                </span>
                <h3 id="experiment-title">Proposed comparison</h3>
              </div>
              <p className="small muted">
                A design for an experiment, not a result. No lift, significance or outcome is
                claimed, because nothing has been run.
              </p>
              <div className="experiment-grid">
                {EXPERIMENT.hypothesisArms.map((arm) => (
                  <div className="arm" key={arm.id}>
                    <p className="arm-name">{arm.name}</p>
                    <p className="arm-cta">“{arm.cta}”</p>
                    <p className="small">{arm.description}</p>
                    <p className="small muted" style={{ marginBottom: 0 }}>
                      Measured on: {arm.primaryMetric}
                    </p>
                    <span className="arm-status">{arm.status}</span>
                  </div>
                ))}
              </div>
              <p className="notice" style={{ marginTop: 'var(--space-4)' }}>
                <span>
                  <span className="notice-label">Proposed learning statement</span>
                  {EXPERIMENT.learningStatement}
                </span>
              </p>
            </section>

            {/* Metrics */}
            <section className="board-panel" aria-labelledby="metrics-title">
              <div className="panel-head">
                <span className="panel-number" aria-hidden="true">
                  04
                </span>
                <h3 id="metrics-title">Metrics</h3>
              </div>
              <IllustrativeNotice />
              <div className="arm metric-primary" style={{ marginTop: 'var(--space-4)' }}>
                <p className="arm-name">Primary metric</p>
                <p className="metric-value">{METRICS.primary.illustrative}</p>
                <p className="metric-name" style={{ marginBottom: 'var(--space-2)' }}>
                  {METRICS.primary.name}
                </p>
                <p className="small muted" style={{ marginBottom: 0 }}>
                  {METRICS.primary.definition}
                </p>
              </div>

              <ul className="metric-list" style={{ marginTop: 'var(--space-4)' }}>
                {METRICS.supporting.map((metric) => (
                  <li key={metric.name}>
                    <span className="metric-row">
                      <span className="metric-name">{metric.name}</span>
                      <span className="metric-figure">{metric.illustrative}</span>
                    </span>
                    <span className="small muted">{metric.definition}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* This session */}
          <div className="growth-column">
            <section className="board-panel session-panel" aria-labelledby="session-title">
              <div className="panel-head">
                <span className="panel-number" aria-hidden="true">
                  05
                </span>
                <h3 id="session-title">This session</h3>
              </div>
              <p className="notice notice--local">
                <span>
                  <span className="notice-label">Real local activity</span>
                  These counts come from what you actually did in this browser. They are stored on
                  this device only and are never sent anywhere.
                </span>
              </p>

              <div className="session-grid" style={{ marginTop: 'var(--space-4)' }}>
                {SESSION_STATS.map((stat) => (
                  <div className="stat" key={stat.label}>
                    <span className="stat-value">{stat.value(snapshot)}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>

              <h4>Most recent events</h4>
              {snapshot.recent.length === 0 ? (
                <p className="small muted">
                  No events recorded yet. Start a decision room and they will appear here.
                </p>
              ) : (
                <ul className="event-log">
                  {snapshot.recent.map((event, index) => (
                    <li key={`${event.timestamp}-${index}`}>
                      <span className="event-name">{event.event_name}</span>
                      <span>
                        {new Date(event.timestamp).toLocaleTimeString()} · {event.page_or_section}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="campaign-meta" style={{ marginBottom: 'var(--space-4)' }}>
                <div>
                  <dt>Attributed source</dt>
                  <dd className="campaign-event">{snapshot.source}</dd>
                </div>
                <div>
                  <dt>Session id</dt>
                  <dd className="campaign-event">{snapshot.sessionId}</dd>
                </div>
                <div>
                  <dt>Storage</dt>
                  <dd>
                    {snapshot.persistent
                      ? 'localStorage — survives a refresh on this device'
                      : 'In-memory fallback — localStorage is unavailable'}
                  </dd>
                </div>
              </dl>

              {confirmReset ? (
                <div className="btn-row">
                  <button
                    type="button"
                    className="btn btn--primary btn--small"
                    onClick={() => {
                      room.resetLocalDemo();
                      setConfirmReset(false);
                    }}
                  >
                    Yes, reset local activity
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={() => setConfirmReset(false)}
                  >
                    Keep it
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  onClick={() => setConfirmReset(true)}
                >
                  Reset local demo activity
                </button>
              )}
              <p className="small muted" style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
                Resetting clears the browser-local events and your saved decision room on this
                device. The illustrative data above does not change.
              </p>
            </section>

            <section className="board-panel" aria-labelledby="schema-title">
              <div className="panel-head">
                <span className="panel-number" aria-hidden="true">
                  06
                </span>
                <h3 id="schema-title">Event schema</h3>
              </div>
              <pre className="schema-pre">{EVENT_SCHEMA}</pre>
              <p className="small muted" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
                {ANALYTICS_NOTE}
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
