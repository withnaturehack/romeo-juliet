import { forwardRef } from "react";
import { COLORS } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon" | "auth";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { className: string; style?: React.CSSProperties }
> = {
  primary: {
    className:
      "w-full py-5 text-black text-sm uppercase tracking-[0.2em] hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60 focus:outline-none focus:ring-0",
    style: { background: COLORS.cream, fontFamily: "var(--font-playfair), serif" },
  },
  secondary: {
    className:
      "w-full py-5 text-lg uppercase tracking-[0.1em] hover:opacity-95 active:scale-[0.98] transition-all font-serif",
    style: { background: COLORS.cream, color: COLORS.forestGreen },
  },
  ghost: {
    className:
      "py-2.5 px-4 rounded-xl font-medium transition-opacity hover:opacity-90",
    style: { background: "#1b5e20", color: "white" },
  },
  icon: {
    className:
      "w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/10 backdrop-blur-sm hover:opacity-80 transition-opacity",
    style: {},
  },
  auth: {
    className:
      "w-full py-5 text-black text-sm uppercase tracking-[0.2em] hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60 focus:outline-none focus:ring-0",
    style: { background: COLORS.cream, fontFamily: "var(--font-playfair), serif" },
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", children, className = "", style, type = "button", ...props }, ref) => {
    const v = variantStyles[variant];
    return (
      <button
        ref={ref}
        type={type}
        className={`${v.className} ${className}`}
        style={{ ...v.style, ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
