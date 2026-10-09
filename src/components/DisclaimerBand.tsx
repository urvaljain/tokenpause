/** The product-wide safety disclaimer. Visible, repeated, never dismissible. */
export function DisclaimerBand() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-6)' }}>
      <p className="notice notice--accent">
        <span>
          <span className="notice-label">Please read</span>
          TokenPause is an educational decision-support prototype. It does not verify a property,
          provide legal advice, or replace independent professional review.
        </span>
      </p>
    </div>
  );
}
