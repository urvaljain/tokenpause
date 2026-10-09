import { ILLUSTRATIVE_LABEL } from '../../data/funnel';

/** Repeated above every illustrative metric block in the Growth Lab. */
export function IllustrativeNotice() {
  return (
    <p className="notice notice--illustrative">
      <span>
        <span className="notice-label">Illustrative</span>
        {ILLUSTRATIVE_LABEL}
      </span>
    </p>
  );
}
