import { useMemo, useRef, useState } from 'react';
import { labelFor } from '../data/flow';
import type { DecisionRoom } from '../hooks/useDecisionRoom';
import { useSectionViewed } from '../hooks/useSectionViewed';
import { COPY_FAILED_LABEL, track } from '../lib/analytics';
import { buildSummary } from '../lib/board';
import { copyText } from '../lib/clipboard';

type Props = {
  room: DecisionRoom;
  onStart: () => void;
};

const PREPARE_STEPS = [
  'Read it once yourself and add anything the questions missed.',
  'Copy it into a message or a note for your family member or co-buyer.',
  'Take the same text to an independent lawyer or advisor and ask what they would add.',
  'Keep the copy you shared, so later conversations start from the same facts.',
];

export function DecisionSummaryPanel({ room, onStart }: Props) {
  const { record, board, isSample } = room;
  const [status, setStatus] = useState<{ text: string; state: 'idle' | 'ok' | 'failed' }>({
    text: '',
    state: 'idle',
  });

  const summary = useMemo(
    () =>
      buildSummary({
        answers: record.answers,
        actions: board.actions,
        completedActionIds: board.completedActionIds,
        note: record.note,
        isSample,
      }),
    [board.actions, board.completedActionIds, isSample, record.answers, record.note],
  );

  const summaryRef = useRef<HTMLPreElement | null>(null);
  const panelRef = useSectionViewed<HTMLDivElement>('decision_summary_viewed', {
    page_or_section: 'decision-summary',
    decision_timing: labelFor('timing', record.answers.timing) ?? 'Not specified',
  });

  async function handleCopy() {
    const result = await copyText(summary);
    if (result === 'failed') {
      selectSummaryText(summaryRef.current);
      setStatus({
        text: 'Copying was blocked by the browser. The summary is selected above — press Ctrl/Cmd + C to copy it.',
        state: 'failed',
      });
    } else {
      setStatus({ text: 'Summary copied to your clipboard.', state: 'ok' });
    }
    track('decision_summary_copied', {
      page_or_section: 'decision-summary',
      cta_label: result === 'failed' ? COPY_FAILED_LABEL : 'Copy summary',
      decision_timing: labelFor('timing', record.answers.timing) ?? 'Not specified',
      action_completion_count: board.completedActionIds.length,
      selected_detail_count: record.answers.details.filter((id) => id !== 'nothing').length,
    });
  }

  return (
    <div className="board-panel" id="decision-summary" ref={panelRef} tabIndex={-1}
      style={{ marginTop: 'var(--space-5)' }}>
      <div className="panel-head">
        <span className="panel-number" aria-hidden="true">
          05
        </span>
        <h3>Decision summary</h3>
      </div>

      <div className="summary-grid">
        <div>
          <p className="small muted">
            A plain-text version of your board, written for discussion. It contains no conclusions
            about the property.
          </p>
          <pre className="summary-pre" aria-label="Decision summary text" ref={summaryRef}>
            {summary}
          </pre>

          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={handleCopy}>
              Copy summary
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                if (isSample) {
                  room.exitSample();
                  onStart();
                } else {
                  room.restart('Start a new decision room (summary)');
                  onStart();
                }
              }}
            >
              Start a new decision room
            </button>
          </div>

          <p className="copy-status" data-state={status.state === 'failed' ? 'failed' : undefined}
            role="status" aria-live="polite">
            {status.text}
          </p>

          <p className="saved-note">
            {room.storageIsPersistent
              ? 'Saved locally on this device'
              : 'Held in this tab only — local storage is unavailable'}
          </p>
        </div>

        <div>
          <h4>Prepare to share</h4>
          <p className="small muted">
            TokenPause does not send anything anywhere and does not create a link. Sharing is
            something you do yourself, with the text above.
          </p>
          <ol className="small">
            {PREPARE_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="notice notice--accent">
            <span>
              Before any money moves, consider having the documents reviewed by an independent
              qualified property lawyer or another appropriate professional. TokenPause cannot do
              that for you.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Highlights the summary so a blocked copy can still be done by hand. */
function selectSummaryText(node: HTMLPreElement | null): void {
  if (!node) return;
  try {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  } catch {
    /* Selection is a convenience only. */
  }
}
