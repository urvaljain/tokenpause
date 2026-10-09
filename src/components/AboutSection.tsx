import { SectionHeading } from './ui/SectionHeading';

const LIMITS = [
  'TokenPause does not verify a property.',
  'It does not determine ownership, title, legal risk, fraud, loans, disputes, or transaction safety.',
  'It does not provide legal advice.',
  'It does not replace an independent qualified property lawyer or other appropriate professional.',
  'It has no account, no payment, no document upload, no property search and no backend.',
];

const VALIDATE_NEXT = [
  'Interview people about the pressure moment itself — what they were told, and what they did in the next hour.',
  'Test whether visitors understand the limitations after using the product, not just after reading the disclaimer.',
  'Measure action-board creation by channel, to see which content hook brings people who actually do the thinking work.',
  'Test different content hooks against the same decision room.',
  'Validate downstream quality only with real, consented data.',
];

export function AboutSection() {
  return (
    <section className="section section--sunk" id="about" aria-labelledby="about-title" tabIndex={-1}>
      <div className="container">
        <SectionHeading
          eyebrow="About"
          title="An independent product concept by Urval."
          lede="TokenPause is a portfolio piece: a small, finished product built to show how a growth and product problem can be approached end to end — the pressure moment, the flow, the measurement."
          id="about-title"
        />

        <div className="about-grid">
          <article className="card">
            <h3>What this is not</h3>
            <p className="small muted">
              TokenPause is not affiliated with BhuMe, a law firm, a property broker, a government
              body, or any property-verification service. All example content is fictional.
            </p>
            <ul className="about-list">
              {LIMITS.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>What I would validate next</h3>
            <ul className="about-list">
              {VALIDATE_NEXT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>How it is built</h3>
            <p className="small muted">
              React, TypeScript and Vite, with no backend and no third-party analytics. State and
              events live in <code>localStorage</code>, with an in-memory fallback when storage is
              blocked. The whole thing deploys as a static site.
            </p>
            <p className="small muted" style={{ marginBottom: 0 }}>
              The decision board is generated from your answers by a small scoring function — there
              is no model, no score and no judgement about a property anywhere in it.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
