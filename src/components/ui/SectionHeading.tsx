type Props = {
  eyebrow?: string;
  title: string;
  lede?: string;
  id?: string;
};

export function SectionHeading({ eyebrow, title, lede, id }: Props) {
  return (
    <div className="section-head">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title" id={id}>
        {title}
      </h2>
      {lede ? <p className="lede">{lede}</p> : null}
    </div>
  );
}
