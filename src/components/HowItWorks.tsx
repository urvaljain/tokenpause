import { SectionHeading } from './ui/SectionHeading';

type Props = {
  onGoToRoom: () => void;
  onGoToBoard: () => void;
  onGoToSummary: () => void;
};

export function HowItWorks({ onGoToRoom, onGoToBoard, onGoToSummary }: Props) {
  const steps = [
    {
      number: 1,
      title: 'Capture the situation',
      body: 'Six short questions about what is creating urgency, what you have, and what has been shown to you. About one to two minutes.',
      action: 'Open the decision room',
      onClick: onGoToRoom,
    },
    {
      number: 2,
      title: 'Build the action board',
      body: 'Your answers become a Before You Pay board: the evidence you hold, the questions to ask next, and actions you can tick off.',
      action: 'See the action board',
      onClick: onGoToBoard,
    },
    {
      number: 3,
      title: 'Discuss before you commit',
      body: 'Generate a plain-text summary to read with family, a co-buyer, or an independent lawyer before any money moves.',
      action: 'Jump to the summary',
      onClick: onGoToSummary,
    },
  ];

  return (
    <section className="section" id="how-it-works" aria-labelledby="how-title" tabIndex={-1}>
      <div className="container">
        <SectionHeading
          eyebrow="How TokenPause works"
          title="Three steps between pressure and a plan."
          lede="Nothing here is submitted anywhere. The whole flow runs in your browser and stays on this device."
          id="how-title"
        />

        <div className="how-grid">
          {steps.map((step) => (
            <article className="how-card" key={step.number}>
              <span className="how-number" aria-hidden="true">
                {step.number}
              </span>
              <h3>
                Step {step.number}. {step.title}
              </h3>
              <p>{step.body}</p>
              <button
                type="button"
                className="btn btn--secondary btn--small how-link"
                onClick={step.onClick}
              >
                {step.action}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
