import { SectionHeading } from './ui/SectionHeading';

const PROBLEMS = [
  {
    index: '01',
    title: 'What do I actually know?',
    body: 'Details arrive over calls, photos and forwarded messages. Very little of it is written down in one place.',
  },
  {
    index: '02',
    title: 'What should I request before paying?',
    body: 'A token payment often comes before the documents do — and it is hard to ask for something you have not named yet.',
  },
  {
    index: '03',
    title: 'Who needs to review this with me?',
    body: 'Family, a co-buyer and an independent professional may all have a say, and usually not at the same time.',
  },
];

export function ProblemSection() {
  return (
    <section className="section section--sunk" aria-labelledby="problem-title" tabIndex={-1}>
      <div className="container">
        <SectionHeading
          eyebrow="The pressure moment"
          title="Property decisions often become urgent before they become clear."
          lede="The hardest part is rarely the paperwork itself. It is being asked to commit money while three questions are still open."
          id="problem-title"
        />

        <div className="card-grid">
          {PROBLEMS.map((problem) => (
            <article className="card problem-card" key={problem.index}>
              <span className="problem-index">{problem.index}</span>
              <h3>{problem.title}</h3>
              <p>{problem.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
