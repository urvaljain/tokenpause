import { useState } from 'react';
import { SAMPLE_NOTICE, labelFor } from '../data/flow';
import type { DecisionRoom } from '../hooks/useDecisionRoom';
import { useSectionViewed } from '../hooks/useSectionViewed';
import { DecisionSummaryPanel } from './DecisionSummaryPanel';
import { SectionHeading } from './ui/SectionHeading';

type Props = {
  room: DecisionRoom;
  onStart: () => void;
  onSample: () => void;
};

export function ActionBoardSection({ room, onStart, onSample }: Props) {
  return (
    <section
      className="section section--sunk"
      id="action-board"
      aria-labelledby="board-title"
      tabIndex={-1}
    >
      <div className="container">
        {room.hasBoard ? (
          <BoardContent
            key={room.isSample ? 'sample' : 'own'}
            room={room}
            onStart={onStart}
          />
        ) : (
          <>
            <SectionHeading
              eyebrow="Your action board"
              title="Your Before You Pay Board"
              lede="Answer the six questions and your board appears here — the evidence you hold, the questions to ask next, and the actions you can tick off."
              id="board-title"
            />
            <div className="board-empty card">
              <h3>No board yet</h3>
              <p className="muted">
                Nothing is saved until you answer the first question. If you would rather look around
                first, open the fictional sample — it will not touch your own progress.
              </p>
              <div className="btn-row">
                <button type="button" className="btn btn--primary" onClick={onStart}>
                  Start my decision room
                </button>
                <button type="button" className="btn btn--secondary" onClick={onSample}>
                  See a sample decision room
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function BoardContent({ room, onStart }: { room: DecisionRoom; onStart: () => void }) {
  const { board, record, isSample } = room;
  const sectionRef = useSectionViewed<HTMLDivElement>('action_board_viewed', {
    page_or_section: 'action-board',
    decision_timing: labelFor('timing', record.answers.timing) ?? 'Not specified',
    selected_detail_count: record.answers.details.filter((id) => id !== 'nothing').length,
    action_completion_count: board.completedActionIds.length,
  });

  const completedCount = board.completedActionIds.length;
  const totalActions = board.actions.length;
  const actionProgress = totalActions === 0 ? 0 : Math.round((completedCount / totalActions) * 100);

  return (
    <div ref={sectionRef}>
      <div className="board-head">
        <div>
          <p className="eyebrow">{isSample ? 'Fictional sample board' : 'Your action board'}</p>
          <h2 className="section-title" id="board-title">
            Your Before You Pay Board
          </h2>
          <p className="lede">This is a discussion plan, not a legal conclusion.</p>
        </div>
        <div className="btn-row">
          <a className="btn btn--secondary btn--small" href="#decision-summary">
            Go to decision summary
          </a>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() =>
              isSample ? room.exitSample() : room.restart('Start a new decision room (board)')
            }
          >
            {isSample ? 'Back to my own board' : 'Start a new decision room'}
          </button>
        </div>
      </div>

      {isSample ? (
        <div className="sample-banner">
          <p className="notice notice--sample">
            <span>
              <span className="notice-label">Fictional sample</span>
              {SAMPLE_NOTICE} Ticking actions here changes nothing in your own board.
            </span>
          </p>
          <button type="button" className="btn btn--secondary btn--small" onClick={room.adoptSample}>
            Use these answers as my starting point
          </button>
        </div>
      ) : null}

      <div className="board-grid">
        {/* 1 — evidence */}
        <section className="board-panel" aria-labelledby="panel-evidence">
          <div className="panel-head">
            <span className="panel-number" aria-hidden="true">
              01
            </span>
            <h3 id="panel-evidence">What you already have</h3>
          </div>

          {board.evidence.items.length > 0 ? (
            <>
              <p className="small muted">You mentioned you have:</p>
              <ul className="evidence-list">
                {board.evidence.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="small muted">You have not recorded any details yet.</p>
          )}

          <p className={board.evidence.hasMaterial ? 'small' : 'notice notice--accent'}>
            <span>{board.evidence.message}</span>
          </p>
        </section>

        {/* 2 — questions */}
        <section className="board-panel" aria-labelledby="panel-questions">
          <div className="panel-head">
            <span className="panel-number" aria-hidden="true">
              02
            </span>
            <h3 id="panel-questions">Questions to ask next</h3>
          </div>
          <p className="small muted">
            Discussion questions for the seller, broker, or your own advisor. None of them imply an
            answer.
          </p>
          <ol className="question-list">
            {board.questions.map((question) => (
              <li key={question.id}>
                <span className="question-text">{question.text}</span>
                <span className="question-reason">{question.reason}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 3 — actions */}
        <section className="board-panel" aria-labelledby="panel-actions">
          <div className="panel-head">
            <span className="panel-number" aria-hidden="true">
              03
            </span>
            <h3 id="panel-actions">Suggested next actions</h3>
          </div>

          <p className="action-progress">
            <span>
              {completedCount} of {totalActions} done
            </span>
            <span className="progress-track" aria-hidden="true">
              <span className="progress-fill" style={{ width: `${actionProgress}%` }} />
            </span>
            <span aria-hidden="true">{actionProgress}%</span>
          </p>

          <ul className="action-list">
            {board.actions.map((action) => (
              <li key={action.id}>
                <ActionItem
                  id={action.id}
                  title={action.title}
                  detail={action.detail}
                  done={board.completedActionIds.includes(action.id)}
                  onToggle={() => room.toggleAction(action.id)}
                />
              </li>
            ))}
          </ul>

          <div className="note-field">
            <label htmlFor="board-note">Your note (saved on this device)</label>
            <textarea
              id="board-note"
              value={record.note}
              maxLength={2000}
              placeholder="e.g. Asked for the latest record on Tuesday. Waiting on the loan document."
              onChange={(event) => room.setNote(event.target.value)}
            />
            <p className="small muted">
              Keep it factual — what was said, by whom, and when. {record.note.length}/2000
              characters.
            </p>
          </div>
        </section>

        {/* 4 — pressure check */}
        <section className="board-panel pressure-check" aria-labelledby="panel-pressure">
          <div className="panel-head">
            <span className="panel-number" aria-hidden="true">
              04
            </span>
            <h3 id="panel-pressure">Pressure check</h3>
          </div>
          <p className="pressure-timing">Decision timing: {board.pressure.timingLabel}</p>
          <p>{board.pressure.body}</p>
          <p className="small muted">
            TokenPause does not rate, score or grade your situation. There is no verdict here —
            only a reminder of what is still open.
          </p>
        </section>
      </div>

      <DecisionSummaryPanel room={room} onStart={onStart} />
    </div>
  );
}

type ActionItemProps = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
  onToggle: () => void;
};

function ActionItem({ id, title, detail, done, onToggle }: ActionItemProps) {
  const [open, setOpen] = useState(false);
  const detailId = `action-detail-${id}`;

  return (
    <div className={`action-item${done ? ' action-item--done' : ''}`}>
      <div className="action-row">
        <label className="action-check" htmlFor={`action-${id}`}>
          <input id={`action-${id}`} type="checkbox" checked={done} onChange={onToggle} />
          <span>
            <span className="action-title">{title}</span>
            {done ? <span className="action-done-flag">Done</span> : null}
          </span>
        </label>
        <button
          type="button"
          className="btn btn--ghost btn--small disclosure"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? 'Hide' : 'Why'}
        </button>
      </div>
      {open ? (
        <p className="action-detail" id={detailId}>
          {detail}
        </p>
      ) : null}
    </div>
  );
}
