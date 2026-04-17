import { forwardRef } from "react";
import { Text } from "./Text";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelId?: string;
  error?: string;
}

const inputBaseClass =
  "w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-2 px-0 text-lg font-light placeholder:text-white/20 focus:outline-none focus:border-[#F8EDE3] transition-colors";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelId, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? labelId;
    return (
      <div className="flex flex-col space-y-1">
        {label && (
          <Text as="label" variant="label" htmlFor={inputId}>
            {label}
          </Text>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${inputBaseClass} ${className}`}
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
