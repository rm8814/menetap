import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
  children: ReactNode;
};

export function Button({ variant = "primary", href, className = "", children, ...props }: ButtonProps) {
  if (href) {
    return <a href={href} className={`ds-button ds-button-${variant} ${className}`.trim()}>{children}</a>;
  }
  return <button className={`ds-button ds-button-${variant} ${className}`.trim()} {...props}>{children}</button>;
}
