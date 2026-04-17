import { Text } from "./Text";

export interface DividerProps {
  className?: string;
  /** Color for the infinity symbol, e.g. "text-white/50" or "text-gold" */
  symbolClassName?: string;
  /** Line opacity: "default" (white/20) or "subtle" (white/10) */
  variant?: "default" | "subtle";
}

export function Divider({
  className = "",
  symbolClassName = "text-white/50",
  variant = "default",
}: DividerProps) {
  const lineClass = variant === "subtle" ? "bg-white/10" : "bg-white/20";
  const lineHeight = variant === "subtle" ? "h-[1px]" : "h-[0.5px]";
  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className={`${lineHeight} flex-grow ${lineClass}`} />
      <Text
        as="span"
        variant="serif"
        className={`px-6 text-sm ${symbolClassName}`}
      >
        ∞
      </Text>
      <div className={`${lineHeight} flex-grow ${lineClass}`} />
    </div>
  );
}
