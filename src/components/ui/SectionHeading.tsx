import Reveal from "./Reveal";

export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      <div
        className={`flex items-center gap-3 text-sm text-muted font-mono ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="text-accent-2">{index}</span>
        <span className="h-px w-8 bg-border" />
        <span className="uppercase tracking-[0.25em]">{eyebrow}</span>
      </div>
      <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 max-w-2xl text-muted text-base sm:text-lg leading-relaxed ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
