export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h2 style={{ fontSize: 'var(--step-2)' }}>Pause before you pay.</h2>
            <p className="footer-note">
              TokenPause is an educational decision-support prototype. It does not verify a
              property, provide legal advice, or replace independent professional review. Example
              data is fictional.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--step-0)' }}>On this page</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <a href="#how-it-works">How it works</a>
              </li>
              <li>
                <a href="#decision-room">Start decision room</a>
              </li>
              <li>
                <a href="#action-board">Your action board</a>
              </li>
              <li>
                <a href="#campaigns">Content campaign</a>
              </li>
              <li>
                <a href="#growth-lab">Growth Lab</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="footer-meta">
          An independent product concept by Urval. Not affiliated with BhuMe, any law firm, broker,
          government body, or property-verification service. No real people, properties, documents
          or records are used anywhere in this prototype.
        </p>
      </div>
    </footer>
  );
}
