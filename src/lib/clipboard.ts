/**
 * Clipboard copy with a textarea fallback for browsers (or insecure contexts)
 * where the async Clipboard API is unavailable or rejected.
 */

export type CopyResult = 'copied' | 'fallback-copied' | 'failed';

export async function copyText(text: string): Promise<CopyResult> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    /* Fall through to the legacy path below. */
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok ? 'fallback-copied' : 'failed';
  } catch {
    return 'failed';
  }
}
