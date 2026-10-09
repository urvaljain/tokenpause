import { useEffect, useRef } from 'react';
import { STEPS, SAMPLE_NOTICE, SAMPLE_SCENARIO, labelFor, labelsFor } from '../data/flow';
import { track } from '../lib/analytics';
import type { DecisionRoom } from '../hooks/useDecisionRoom';
import { SectionHeading } from './ui/SectionHeading';

type Props = {
  room: DecisionRoom;
  onGoToBoard: () => void;
};

export function DecisionRoomSection({ room, onGoToBoard }: Props) {
  const { step, stepIndex, totalSteps, showFlow, isSample, record } = room;

  // One `decision_step_viewed` event per question the visitor actually sees.
  const lastViewedStep = useRef<string | null>(null);
  useEffect(() => {
    if (!showFlow) {
      lastViewedStep.current = null;
      return;
    }
    const key = `${isSample ? 'sample' : 'own'}-${stepIndex}`;
    if (lastViewedStep.current === key) return;
    lastViewedStep.current = key;
    track('decision_step_viewed', {
      page_or_section: `decision-room/step-${STEPS[stepIndex].number}-${STEPS[stepIndex].id}`,
      cta_label: STEPS[stepIndex].question,
    });
  }, [showFlow, stepIndex, isSample]);

  // Progress tracks how much of the room is answered, so it stays meaningful
  // when the visitor jumps back to review a question.
  const progress = Math.round((room.answeredSteps / totalSteps) * 100);

  return (
    <section className="section" id="decision-room" aria-labelledby="room-title" tabIndex={-1}>
      <div className="container">
        <SectionHeading
          eyebrow="The decision room"
          title="Six questions about where you are right now."
          lede="There are no right answers and nothing is verified. The point is to get what you know out of your head and into one place before the next conversation."
          id="room-title"
        />

        {isSample ? (
          <div className="sample-banner">
            <p className="notice notice--sample">
              <span>
                <span className="notice-label">Fictional sample</span>
                {SAMPLE_NOTICE} Your own answers are saved separately and have not been changed.
              </span>
            </p>
            <button type="button" className="btn btn--secondary btn--small" onClick={room.exitSample}>
              Back to my own room
            </button>
          </div>
        ) : null}

        <div className="room">
          <aside className="room-rail" aria-label="Decision room progress">
            <div className="progress">
              <div className="progress-head">
                <span>
                  {showFlow ? `Question ${step.number} of ${totalSteps}` : 'All six questions answered'}
                </span>
                <span>
                  {room.answeredSteps}/{totalSteps} answered
                </span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totalSteps}
                aria-valuenow={room.answeredSteps}
                aria-valuetext={`${room.answeredSteps} of ${totalSteps} questions answered`}
              >
                <span
                  className="progress-fill"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>

              <ul className="step-list">
                {STEPS.map((candidate, index) => {
                  const answered =
                    candidate.kind === 'multi'
                      ? (record.answers[candidate.id] as string[]).length > 0
                      : record.answers[candidate.id] !== null;
                  const isCurrent = showFlow && index === stepIndex;
                  return (
                    <li key={candidate.id}>
                      <button
                        type="button"
                        className={`step-jump${answered ? ' step-jump--done' : ''}`}
                        aria-current={isCurrent ? 'step' : undefined}
                        onClick={() => {
                          if (!showFlow) room.reviewAnswers();
                          room.goToStep(index);
                        }}
                      >
                        <span className="step-tick" aria-hidden="true">
                          {answered ? '✓' : candidate.number}
                        </span>
                        <span>
                          {candidate.eyebrow}
                          {answered ? <span className="muted"> · answered</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="small muted">
              {room.storageIsPersistent
                ? 'Your answers are saved locally on this device, so you can come back to the board after a refresh.'
                : 'Local storage is unavailable in this browser, so answers will last only until you close the tab.'}
            </p>
          </aside>

          {showFlow ? (
            <div className="flow-card" key={`${isSample ? 'sample' : 'own'}-${step.id}`}>
              <fieldset className="flow-fieldset">
                <legend className="flow-legend">{step.question}</legend>
                {step.helper ? <p className="flow-helper">{step.helper}</p> : null}

                <div className="choice-list">
                  {step.options.map((option) => {
                    const inputId = `${step.id}-${option.id}`;
                    const checked =
                      step.kind === 'multi'
                        ? (record.answers[step.id] as string[]).includes(option.id)
                        : record.answers[step.id] === option.id;
                    return (
                      <label className="choice" key={option.id} htmlFor={inputId}>
                        <input
                          id={inputId}
                          type={step.kind === 'multi' ? 'checkbox' : 'radio'}
                          name={step.id}
                          value={option.id}
                          checked={checked}
                          onChange={() =>
                            step.kind === 'multi'
                              ? room.toggleMulti(step.id, option.id)
                              : room.setSingle(step.id, option.id)
                          }
                        />
                        <span className="choice-text">{option.label}</span>
                      </label>
                    );
                  })}
                </div>

                {step.id === 'timing' && record.answers.timing === 'today' ? (
                  <p className="notice notice--accent flow-inline-note">
                    <span>
                      A deadline may be real, but it does not replace the need to understand what is
                      being requested.
                    </span>
                  </p>
                ) : null}

                {step.kind === 'multi' ? (
                  <p className="small muted">
                    Select as many as apply, or none — an incomplete picture is still a useful
                    starting point.
                  </p>
                ) : null}
              </fieldset>

              <div className="flow-nav">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={room.previous}
                  disabled={stepIndex === 0}
                >
                  Previous
                </button>
                <button type="button" className="btn btn--primary" onClick={room.next}>
                  {room.isLastStep ? 'Build my board' : 'Next'}
                </button>
                <span className="flow-nav-spacer" />
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() =>
                    isSample ? room.exitSample() : room.restart('Start over from question one')
                  }
                >
                  {isSample ? 'Leave the sample' : 'Start over'}
                </button>
              </div>
            </div>
          ) : (
            <div className="room-done">
              <p className="eyebrow eyebrow--plain">
                {isSample ? 'Fictional sample room' : 'Your decision room'}
              </p>
              <h3>All six questions answered.</h3>
              <p className="muted">
                {isSample
                  ? 'This is the fictional scenario below, answered in the flow.'
                  : 'You can revisit any answer — your board updates immediately.'}
              </p>

              {isSample ? (
                <pre className="summary-pre" aria-label="Fictional sample scenario">
                  {SAMPLE_SCENARIO}
                </pre>
              ) : null}

              <div className="answer-table">
                {STEPS.map((candidate) => {
                  const value =
                    candidate.kind === 'multi'
                      ? labelsFor(candidate.id, record.answers[candidate.id] as string[]).join(' · ')
                      : labelFor(candidate.id, record.answers[candidate.id] as string | null);
                  return (
                    <div className="answer-row" key={candidate.id}>
                      <span className="answer-label">{candidate.eyebrow}</span>
                      <span className="answer-value">
                        {value && value.length > 0 ? value : <span className="muted">Skipped</span>}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="btn-row">
                <button type="button" className="btn btn--primary" onClick={onGoToBoard}>
                  View my Before You Pay board
                </button>
                <button type="button" className="btn btn--secondary" onClick={room.reviewAnswers}>
                  Review my answers
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() =>
                    isSample
                      ? room.exitSample()
                      : room.restart('Start a new decision room (room card)')
                  }
                >
                  {isSample ? 'Leave the sample' : 'Start a new decision room'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
