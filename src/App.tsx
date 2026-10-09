import { useEffect } from 'react';
import type { Campaign } from './data/campaigns';
import { AboutSection } from './components/AboutSection';
import { ActionBoardSection } from './components/ActionBoardSection';
import { CampaignSection } from './components/CampaignSection';
import { DecisionRoomSection } from './components/DecisionRoomSection';
import { DisclaimerBand } from './components/DisclaimerBand';
import { GrowthLab } from './components/GrowthLab';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { ProblemSection } from './components/ProblemSection';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { useDecisionRoom } from './hooks/useDecisionRoom';
import { setSource, track } from './lib/analytics';
import { scrollToSection } from './lib/scroll';

/** Guards against a duplicate landing event under React's dev-mode double effect. */
let landingTracked = false;

export default function App() {
  const room = useDecisionRoom();

  useEffect(() => {
    if (landingTracked) return;
    landingTracked = true;
    track('landing_viewed', { page_or_section: 'landing' });
  }, []);

  function startRoom(ctaLabel: string) {
    room.startRoom(ctaLabel);
    scrollToSection('decision-room');
  }

  function openSample(ctaLabel: string, campaign?: Campaign) {
    room.openSample(ctaLabel, campaign?.source);
    scrollToSection('action-board');
  }

  function handlePreviewJourney(campaign: Campaign) {
    setSource(campaign.source);
    track('reel_journey_started', {
      page_or_section: 'campaigns',
      source: campaign.source,
      cta_label: campaign.cta,
    });

    switch (campaign.journey) {
      case 'decision-room':
        startRoom(`${campaign.label}: ${campaign.cta}`);
        break;
      case 'sample':
        openSample(`${campaign.label}: ${campaign.cta}`, campaign);
        break;
      case 'summary':
        if (room.hasBoard) {
          scrollToSection('decision-summary');
        } else {
          startRoom(`${campaign.label}: ${campaign.cta}`);
        }
        break;
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader onStart={() => startRoom('Pause before you pay (header)')} />

      <main id="main">
        <Hero
          onStart={() => startRoom('Start my decision room (hero)')}
          onSample={() => openSample('Explore a sample (hero)')}
        />
        <DisclaimerBand />
        <ProblemSection />
        <HowItWorks
          onGoToRoom={() => startRoom('Open the decision room (how it works)')}
          onGoToBoard={() => scrollToSection('action-board')}
          onGoToSummary={() =>
            room.hasBoard
              ? scrollToSection('decision-summary')
              : startRoom('Jump to the summary (how it works)')
          }
        />
        <DecisionRoomSection room={room} onGoToBoard={() => scrollToSection('action-board')} />
        <ActionBoardSection
          room={room}
          onStart={() => startRoom('Start my decision room (board)')}
          onSample={() => openSample('See a sample decision room (board)')}
        />
        <CampaignSection onPreviewJourney={handlePreviewJourney} />
        <GrowthLab room={room} />
        <AboutSection />
      </main>

      <SiteFooter />
    </>
  );
}
