import { useEffect, useRef } from 'react';
import { track, type EventName, type EventProps } from '../lib/analytics';

/**
 * Fires a view event the first time a section becomes substantially visible.
 * Falls back to firing on mount where IntersectionObserver is unavailable.
 */
export function useSectionViewed<T extends HTMLElement>(
  event: EventName,
  props: EventProps,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);
  // Props are read inside the observer callback; keeping them in a ref avoids
  // re-creating the observer every render.
  const latestProps = useRef(props);
  useEffect(() => {
    latestProps.current = props;
  }, [props]);

  useEffect(() => {
    if (fired.current) return;
    const node = ref.current;

    if (!node || typeof IntersectionObserver === 'undefined') {
      fired.current = true;
      track(event, latestProps.current);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            track(event, latestProps.current);
            observer.disconnect();
          }
        }
      },
      // Sections can be several screens tall, so a ratio threshold would never
      // be reached. Fire once any part of the section is comfortably in view.
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [event]);

  return ref;
}
