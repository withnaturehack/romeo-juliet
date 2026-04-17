import { COLORS } from "@/lib/theme";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main";
}

export function PageContainer({ children, className = "", as: Component = "div" }: PageContainerProps) {
  return (
    <Component
      className={`min-h-screen text-white ${className}`}
      style={{
        background: COLORS.forestGreen,
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {children}
    </Component>
  );
}
