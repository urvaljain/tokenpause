const NAV_ITEMS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#decision-room', label: 'Start decision room' },
  { href: '#action-board', label: 'Your action board' },
  { href: '#growth-lab', label: 'Growth Lab' },
  { href: '#about', label: 'About' },
];

type Props = {
  onStart: () => void;
};

export function SiteHeader({ onStart }: Props) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          TokenPause
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a className="nav-link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-cta">
          <button type="button" className="btn btn--primary btn--small" onClick={onStart}>
            Pause before you pay
          </button>
        </div>
      </div>
    </header>
  );
}
