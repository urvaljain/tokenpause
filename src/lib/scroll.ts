/** Scrolls a section into view and moves focus there for keyboard users. */
export function scrollToSection(id: string): void {
  const node = document.getElementById(id);
  if (!node) return;

  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  node.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

  // Sections carry tabindex="-1" so focus can follow the scroll without
  // introducing a tab stop.
  window.setTimeout(() => node.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
}
