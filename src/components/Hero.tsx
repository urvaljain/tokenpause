type Props = {
  onStart: () => void;
  onSample: () => void;
};

const TRUST_STATEMENTS = [
  'Organise questions, not legal conclusions',
  'Built for conversations before commitment',
  'Educational guidance only',
];

export function Hero({ onStart, onSample }: Props) {
  return (
    <section className="section hero" id="top" aria-labelledby="hero-title" tabIndex={-1}>
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Independent product concept</p>
          <h1 className="hero-title" id="hero-title">
            Before you pay a property token, pause for five minutes.
          </h1>
          <p className="hero-lede">
            Turn pressure into a practical discussion plan: what you know, what to request, and who
            to involve before transferring money.
          </p>

          <div className="btn-row hero-actions">
            <button type="button" className="btn btn--primary" onClick={onStart}>
              Start my decision room
            </button>
            <button type="button" className="btn btn--secondary" onClick={onSample}>
              Explore a sample
            </button>
          </div>

          <ul className="trust-list">
            {TRUST_STATEMENTS.map((statement) => (
              <li key={statement}>{statement}</li>
            ))}
          </ul>
        </div>

        <aside className="pressure-card" aria-label="A moment of decision pressure">
          <div className="pressure-block">
            <span className="pressure-speaker">Broker says</span>
            <p className="pressure-quote">
              “Someone else is interested. Can you pay the token today?”
            </p>
          </div>
          <div className="pressure-block pressure-answer">
            <span className="pressure-speaker">TokenPause says</span>
            <p className="pressure-quote">“Urgency is not evidence.”</p>
          </div>
          <p className="pressure-foot">
            A deadline can be real and still leave you room to ask one more question.
          </p>
        </aside>
      </div>
    </section>
  );
}
