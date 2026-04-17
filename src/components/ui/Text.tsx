import { COLORS } from "@/lib/theme";

type TextVariant =
  | "script"
  | "serif"
  | "tagline"
  | "body"
  | "label"
  | "heading"
  | "sectionTitle";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "label";
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

const variantStyles: Record<
  TextVariant,
  { className: string; style: React.CSSProperties }
> = {
  script: {
    className: "",
    style: { fontFamily: "var(--font-pinyon), cursive" },
  },
  serif: {
    className: "",
    style: { fontFamily: "var(--font-playfair), serif" },
  },
  tagline: {
    className: "",
    style: { fontFamily: "var(--font-manrope), sans-serif", color: COLORS.cream },
  },
  body: {
    className: "",
    style: { fontFamily: "var(--font-inter), sans-serif" },
  },
  label: {
    className: "text-[10px] uppercase tracking-[0.2em] text-white/60",
    style: { fontFamily: "var(--font-playfair), serif" },
  },
  heading: {
    className: "text-3xl sm:text-4xl font-semibold text-white tracking-wide",
    style: { fontFamily: "var(--font-playfair), serif" },
  },
  sectionTitle: {
    className:
      "text-lg sm:text-xl font-semibold text-white tracking-wide underline underline-offset-8 decoration-white/40",
    style: { fontFamily: "var(--font-playfair), serif" },
  },
};

export function Text({
  variant = "body",
  as: Component = "p",
  children,
  className = "",
  style,
  ...props
}: TextProps) {
  const v = variantStyles[variant];
  return (
    <Component
      className={`${v.className} ${className}`}
      style={{ ...v.style, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}
