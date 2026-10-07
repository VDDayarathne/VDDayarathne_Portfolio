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
    <Reveal className={cn("section-heading", align === "center" && "mx-auto text-center")}>
      <div className={cn("eyebrow flex items-center gap-3 text-muted", align === "center" && "justify-center")}>
        <span className="text-accent">{index}</span>
        <span aria-hidden="true" className="h-px w-7 bg-border" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="section-title text-foreground">{title}</h2>
      {description && (
        <p className={cn("body-copy section-description", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </Reveal>
  );
}
