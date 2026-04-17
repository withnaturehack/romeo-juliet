export interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full border-2 border-[#2e7d32]/40 border-t-[#2e7d32] animate-spin ${className}`}
    />
  );
}
