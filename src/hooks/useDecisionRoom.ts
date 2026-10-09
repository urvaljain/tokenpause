import { useCallback, useMemo, useState } from 'react';
import {
  EMPTY_ANSWERS,
  SAMPLE_ANSWERS,
  STEPS,
  TOTAL_STEPS,
  getStep,
  labelFor,
  type Answers,
  type StepId,
} from '../data/flow';
import {
  ACTION_COMPLETED_LABEL,
  resetAnalytics,
  setSource,
  track,
  type Source,
} from '../lib/analytics';
import { deriveActions, deriveEvidence, deriveQuestions, derivePressure } from '../lib/board';
import { readJson, removeKey, storageIsPersistent, writeJson } from '../lib/storage';

const ROOM_KEY = 'tokenpause.room.v1';

export type RoomMode = 'own' | 'sample';

export type RoomRecord = {
  answers: Answers;
  /** Index into STEPS of the question currently being answered. */
  stepIndex: number;
  completed: boolean;
  completedActionIds: string[];
  note: string;
  startedAt: string | null;
  completedAt: string | null;
};

const EMPTY_ROOM: RoomRecord = {
  answers: EMPTY_ANSWERS,
  stepIndex: 0,
  completed: false,
  completedActionIds: [],
  note: '',
  startedAt: null,
  completedAt: null,
};

const SAMPLE_ROOM: RoomRecord = {
  answers: SAMPLE_ANSWERS,
  stepIndex: TOTAL_STEPS - 1,
  completed: true,
  completedActionIds: [],
  note: '',
  startedAt: null,
  completedAt: null,
};

/** Shape-checks persisted state so an old or hand-edited value cannot break the UI. */
function normalise(value: unknown): RoomRecord {
  if (typeof value !== 'object' || value === null) return EMPTY_ROOM;
  const raw = value as Partial<RoomRecord>;
  const answers = (raw.answers ?? {}) as Partial<Answers>;
  const validId = (stepId: StepId, id: unknown): string | null =>
    typeof id === 'string' && getStep(stepId).options.some((option) => option.id === id)
      ? id
      : null;
  const validIds = (stepId: StepId, ids: unknown): string[] =>
    Array.isArray(ids) ? ids.filter((id): id is string => validId(stepId, id) !== null) : [];

  return {
    answers: {
      urgency: validId('urgency', answers.urgency),
      details: validIds('details', answers.details),
      shared: validIds('shared', answers.shared),
      audience: validId('audience', answers.audience),
      clarity: validId('clarity', answers.clarity),
      timing: validId('timing', answers.timing),
    },
    stepIndex:
      typeof raw.stepIndex === 'number' && raw.stepIndex >= 0 && raw.stepIndex < TOTAL_STEPS
        ? Math.floor(raw.stepIndex)
        : 0,
    completed: raw.completed === true,
    completedActionIds: Array.isArray(raw.completedActionIds)
      ? raw.completedActionIds.filter((id): id is string => typeof id === 'string')
      : [],
    note: typeof raw.note === 'string' ? raw.note.slice(0, 2000) : '',
    startedAt: typeof raw.startedAt === 'string' ? raw.startedAt : null,
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
  };
}

function answeredCount(answers: Answers): number {
  return STEPS.filter((step) =>
    step.kind === 'multi'
      ? (answers[step.id] as string[]).length > 0
      : answers[step.id] !== null,
  ).length;
}

export type DecisionRoom = ReturnType<typeof useDecisionRoom>;

/**
 * Owns all decision-room state: the visitor's own room (persisted locally) and
 * the fictional sample room (held in memory so it never overwrites real
 * progress unless the visitor explicitly adopts it).
 */
export function useDecisionRoom() {
  const [own, setOwn] = useState<RoomRecord>(() => normalise(readJson(ROOM_KEY, EMPTY_ROOM)));
  const [sample, setSample] = useState<RoomRecord>(SAMPLE_ROOM);
  const [mode, setMode] = useState<RoomMode>('own');
  const [isEditing, setIsEditing] = useState(false);

  const record = mode === 'sample' ? sample : own;
  const isSample = mode === 'sample';

  const update = useCallback(
    (patch: Partial<RoomRecord> | ((current: RoomRecord) => Partial<RoomRecord>)) => {
      const apply = (current: RoomRecord): RoomRecord => ({
        ...current,
        ...(typeof patch === 'function' ? patch(current) : patch),
      });
      if (isSample) {
        setSample(apply);
        return;
      }
      setOwn((current) => {
        const next = apply(current);
        writeJson(ROOM_KEY, next);
        return next;
      });
    },
    [isSample],
  );

  /* --------------------------- derived board --------------------------- */

  const board = useMemo(() => {
    const actions = deriveActions(record.answers);
    return {
      evidence: deriveEvidence(record.answers),
      questions: deriveQuestions(record.answers),
      actions,
      pressure: derivePressure(record.answers),
      completedActionIds: record.completedActionIds.filter((id) =>
        actions.some((action) => action.id === id),
      ),
    };
  }, [record.answers, record.completedActionIds]);

  const step = STEPS[Math.min(record.stepIndex, TOTAL_STEPS - 1)];
  const answeredSteps = answeredCount(record.answers);
  const isLastStep = record.stepIndex === TOTAL_STEPS - 1;
  const showFlow = isEditing || !record.completed;

  /* ----------------------------- mutations ----------------------------- */

  const startRoom = useCallback(
    (ctaLabel: string) => {
      setMode('own');
      setIsEditing(true);
      setOwn((current) => {
        // A completed room re-opens at question one; an unfinished one resumes
        // wherever the visitor left off.
        const next: RoomRecord = {
          ...current,
          stepIndex: current.completed ? 0 : current.stepIndex,
          startedAt: current.startedAt ?? new Date().toISOString(),
        };
        writeJson(ROOM_KEY, next);
        return next;
      });
      track('decision_room_started', { page_or_section: 'decision-room', cta_label: ctaLabel });
    },
    [],
  );

  const setSingle = useCallback(
    (stepId: StepId, optionId: string) => {
      update((current) => ({
        answers: { ...current.answers, [stepId]: optionId },
        startedAt: current.startedAt ?? new Date().toISOString(),
      }));
      track('decision_answer_selected', {
        page_or_section: `decision-room/step-${getStep(stepId).number}-${stepId}`,
        cta_label: labelFor(stepId, optionId) ?? optionId,
        decision_timing:
          stepId === 'timing' ? (labelFor('timing', optionId) ?? undefined) : undefined,
      });
    },
    [update],
  );

  const toggleMulti = useCallback(
    (stepId: StepId, optionId: string) => {
      const option = getStep(stepId).options.find((candidate) => candidate.id === optionId);
      const exclusiveIds = getStep(stepId)
        .options.filter((candidate) => candidate.exclusive)
        .map((candidate) => candidate.id);

      update((current) => {
        const selected = current.answers[stepId] as string[];
        const isSelected = selected.includes(optionId);
        let next: string[];
        if (isSelected) {
          next = selected.filter((id) => id !== optionId);
        } else if (option?.exclusive) {
          // "Nothing collected yet" / "I am not sure" stand alone.
          next = [optionId];
        } else {
          next = [...selected.filter((id) => !exclusiveIds.includes(id)), optionId];
        }
        return {
          answers: { ...current.answers, [stepId]: next },
          startedAt: current.startedAt ?? new Date().toISOString(),
        };
      });

      track('decision_answer_selected', {
        page_or_section: `decision-room/step-${getStep(stepId).number}-${stepId}`,
        cta_label: option?.label ?? optionId,
      });
    },
    [update],
  );

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, index));
      update({ stepIndex: clamped });
    },
    [update],
  );

  const next = useCallback(() => {
    if (!isLastStep) {
      goToStep(record.stepIndex + 1);
      return;
    }
    const completedAt = new Date().toISOString();
    update({ completed: true, completedAt });
    setIsEditing(false);
    track('decision_room_completed', {
      page_or_section: 'decision-room',
      decision_timing: labelFor('timing', record.answers.timing) ?? 'Not specified',
      selected_detail_count: record.answers.details.filter((id) => id !== 'nothing').length,
      cta_label: isSample ? 'Sample room completed' : 'Build my board',
    });
  }, [goToStep, isLastStep, isSample, record.answers.details, record.answers.timing, record.stepIndex, update]);

  const previous = useCallback(() => {
    goToStep(record.stepIndex - 1);
  }, [goToStep, record.stepIndex]);

  const reviewAnswers = useCallback(() => {
    setIsEditing(true);
    update({ stepIndex: 0 });
  }, [update]);

  const restart = useCallback(
    (ctaLabel: string) => {
      setMode('own');
      setIsEditing(true);
      const fresh: RoomRecord = { ...EMPTY_ROOM, startedAt: new Date().toISOString() };
      setOwn(fresh);
      writeJson(ROOM_KEY, fresh);
      track('new_decision_room_started', {
        page_or_section: 'decision-room',
        cta_label: ctaLabel,
      });
    },
    [],
  );

  const toggleAction = useCallback(
    (actionId: string) => {
      const willComplete = !record.completedActionIds.includes(actionId);
      update((current) => ({
        completedActionIds: willComplete
          ? [...current.completedActionIds, actionId]
          : current.completedActionIds.filter((id) => id !== actionId),
      }));
      track('action_item_toggled', {
        page_or_section: 'action-board',
        cta_label: willComplete ? ACTION_COMPLETED_LABEL : 'Marked not done',
        action_completion_count: willComplete
          ? record.completedActionIds.length + 1
          : record.completedActionIds.length - 1,
      });
    },
    [record.completedActionIds, update],
  );

  const setNote = useCallback(
    (note: string) => {
      update({ note: note.slice(0, 2000) });
    },
    [update],
  );

  const openSample = useCallback(
    (ctaLabel: string, attribution: Source = 'sample') => {
      setSource(attribution);
      setSample(SAMPLE_ROOM);
      setMode('sample');
      setIsEditing(false);
      track('sample_decision_room_opened', {
        page_or_section: 'sample',
        cta_label: ctaLabel,
      });
    },
    [],
  );

  const exitSample = useCallback(() => {
    setMode('own');
    setIsEditing(false);
  }, []);

  /** Explicitly copies the fictional sample into the visitor's own room. */
  const adoptSample = useCallback(() => {
    const adopted: RoomRecord = {
      ...sample,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      completedActionIds: [],
      note: '',
    };
    setOwn(adopted);
    writeJson(ROOM_KEY, adopted);
    setMode('own');
    setIsEditing(false);
    track('new_decision_room_started', {
      page_or_section: 'action-board',
      cta_label: 'Use sample answers as my starting point',
    });
  }, [sample]);

  /** Growth Lab reset: local analytics + local prototype state only. */
  const resetLocalDemo = useCallback(() => {
    setOwn(EMPTY_ROOM);
    removeKey(ROOM_KEY);
    setSample(SAMPLE_ROOM);
    setMode('own');
    setIsEditing(false);
    resetAnalytics();
    track('local_demo_reset', {
      page_or_section: 'growth-lab',
      cta_label: 'Reset local demo activity',
    });
  }, []);

  return {
    mode,
    isSample,
    record,
    board,
    step,
    stepIndex: record.stepIndex,
    totalSteps: TOTAL_STEPS,
    answeredSteps,
    isLastStep,
    showFlow,
    isEditing,
    storageIsPersistent,
    hasBoard: record.completed,
    ownHasBoard: own.completed,
    startRoom,
    setSingle,
    toggleMulti,
    goToStep,
    next,
    previous,
    reviewAnswers,
    restart,
    toggleAction,
    setNote,
    openSample,
    exitSample,
    adoptSample,
    resetLocalDemo,
  };
}
