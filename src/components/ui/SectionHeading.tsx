import { cn } from "@/lib/utils";
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
    <div className={cn("section-heading", align === "center" && "mx-auto text-center")}>
      <Reveal preset="fade" className={cn("section-kicker eyebrow flex items-center gap-3 text-muted", align === "center" && "justify-center")}>
          <span className="text-accent">{index}</span>
          <span aria-hidden="true" className="section-heading-rule h-px w-7 bg-border" />
          <span>{eyebrow}</span>
      </Reveal>
      <Reveal preset="heading" delay={0.04} className="section-title-wrap">
        <h2 className="section-title text-foreground">{title}</h2>
      </Reveal>
      {description && (
        <Reveal preset="support" delay={0.1} className={cn("section-description", align === "center" && "mx-auto")}>
          <p className="body-copy">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
