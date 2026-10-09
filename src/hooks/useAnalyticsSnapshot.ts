import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe, type SessionSnapshot } from '../lib/analytics';

/** Live view of the browser-local analytics store. */
export function useAnalyticsSnapshot(): SessionSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
