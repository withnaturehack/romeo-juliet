interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const roundedMap = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({ width, height, rounded = "md", className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${roundedMap[rounded]} ${className}`}
      style={{ width: width ?? "100%", height: height ?? "1rem" }}
    />
  );
}
