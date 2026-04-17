import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, subtitle, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <p className="text-lg font-medium text-gray-800 mb-1">{title}</p>
      {subtitle && <p className="text-gray-500 text-sm max-w-xs mb-5">{subtitle}</p>}
      {cta && (
        <button
          onClick={cta.onClick}
          className="px-5 py-2.5 rounded-full bg-[#4A5E41] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
