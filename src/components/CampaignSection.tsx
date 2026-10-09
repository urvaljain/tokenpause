import { useState } from 'react';
import { CAMPAIGNS, type Campaign } from '../data/campaigns';
import { track } from '../lib/analytics';
import { useSectionViewed } from '../hooks/useSectionViewed';
import { SectionHeading } from './ui/SectionHeading';

type Props = {
  onPreviewJourney: (campaign: Campaign) => void;
};

export function CampaignSection({ onPreviewJourney }: Props) {
  const sectionRef = useSectionViewed<HTMLElement>('campaign_section_viewed', {
    page_or_section: 'campaigns',
  });

  return (
    <section
      className="section"
      id="campaigns"
      aria-labelledby="campaign-title"
      tabIndex={-1}
      ref={sectionRef}
    >
      <div className="container">
        <SectionHeading
          eyebrow="Content-to-product campaign"
          title="From content pressure to product clarity"
          lede="TokenPause is designed to be discovered at the moment the pressure appears — in a short-form video someone watches while a broker is waiting for an answer. Each concept below is planned to lead into one specific part of the product, with one thing it is meant to teach us."
          id="campaign-title"
        />

        <p className="notice">
          <span>
            <span className="notice-label">Concepts only</span>
            These three Reels are planned concepts for this portfolio exercise. They have not been
            posted, have no views or reach, and no results are claimed. “Preview journey” attributes
            your visit locally and takes you to the part of the product the concept points at.
          </span>
        </p>

        <div className="campaign-grid" style={{ marginTop: 'var(--space-5)' }}>
          {CAMPAIGNS.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onPreviewJourney={onPreviewJourney}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CampaignCard({
  campaign,
  onPreviewJourney,
}: {
  campaign: Campaign;
  onPreviewJourney: (campaign: Campaign) => void;
}) {
  const [open, setOpen] = useState(false);
  const storyboardId = `storyboard-${campaign.id}`;

  function toggleStoryboard() {
    const next = !open;
    setOpen(next);
    if (next) {
      track('reel_card_opened', {
        page_or_section: 'campaigns',
        source: campaign.source,
        cta_label: campaign.title,
      });
    }
  }

  return (
    <article className="campaign-card">
      <span className="campaign-label">{campaign.label}</span>
      <h3>{campaign.title}</h3>
      <p className="campaign-hook">“{campaign.hook}”</p>

      <dl className="campaign-meta">
        <div>
          <dt>Audience</dt>
          <dd>{campaign.audience}</dd>
        </div>
        <div>
          <dt>Content format</dt>
          <dd>{campaign.format}</dd>
        </div>
        <div>
          <dt>Call to action</dt>
          <dd>{campaign.cta}</dd>
        </div>
        <div>
          <dt>Intended event</dt>
          <dd className="campaign-event">{campaign.intendedEvent}</dd>
        </div>
        <div>
          <dt>Learning question</dt>
          <dd>{campaign.learningQuestion}</dd>
        </div>
      </dl>

      <div>
        <button
          type="button"
          className="btn btn--secondary btn--small"
          aria-expanded={open}
          aria-controls={storyboardId}
          onClick={toggleStoryboard}
        >
          {open ? 'Hide storyboard' : 'View storyboard'}
        </button>
        {open ? (
          <ol className="storyboard" id={storyboardId} style={{ marginTop: 'var(--space-3)' }}>
            {campaign.storyboard.map((frame) => (
              <li key={frame}>{frame}</li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="campaign-foot">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onPreviewJourney(campaign)}
        >
          Preview journey
        </button>
        <p className="small muted" style={{ margin: 0 }}>
          Takes you to: {journeyLabel(campaign)}
        </p>
      </div>
    </article>
  );
}

function journeyLabel(campaign: Campaign): string {
  switch (campaign.journey) {
    case 'decision-room':
      return 'the decision room, starting at question one';
    case 'sample':
      return 'the fictional sample decision room';
    case 'summary':
      return 'the decision summary panel';
  }
}
