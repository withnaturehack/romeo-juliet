import { forwardRef } from "react";
import { Text } from "./Text";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelId?: string;
  options: { value: string; label: string }[];
}

const selectBaseClass =
  "w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-2 px-0 text-lg font-light text-white focus:outline-none focus:border-[#F8EDE3] transition-colors appearance-none";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, labelId, options, id, className = "", ...props }, ref) => {
    const selectId = id ?? labelId;
    return (
      <div className="flex flex-col space-y-1">
        {label && (
          <Text as="label" variant="label" htmlFor={selectId}>
            {label}
          </Text>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${selectBaseClass} ${className}`}
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
          {...props}
        >
          <option value="" className="bg-[#0B2014] text-white/20">
            Select
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0B2014]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
