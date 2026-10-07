import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

type AnchorProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps> & {
    href: string;
    as?: "a";
    disabled?: boolean;
  };

type NativeButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps> & {
    href?: never;
    as?: "button";
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

export default function Button({
  children,
  variant = "primary",
  className,
  as,
  disabled,
  ...attributes
}: ButtonProps) {
  const classes = cn("button", `button--${variant}`, className);

  if (as === "a" || ("href" in attributes && typeof attributes.href === "string")) {
    const anchorAttributes = attributes as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        {...anchorAttributes}
        href={disabled ? undefined : anchorAttributes.href}
        className={classes}
        data-cursor="button"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : anchorAttributes.tabIndex}
        onClick={disabled ? (event) => event.preventDefault() : anchorAttributes.onClick}
      >
        {children}
      </a>
    );
  }

  const buttonAttributes = attributes as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...buttonAttributes}
      type={buttonAttributes.type ?? "button"}
      disabled={disabled}
      className={classes}
      data-cursor="button"
    >
      {children}
    </button>
  );
}
