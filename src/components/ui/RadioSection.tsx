import { Text } from "./Text";

export interface RadioSectionProps<T extends string> {
  name: string;
  title: string;
  options: readonly { value: T; label: string }[];
  value: string;
  onChange: (v: T) => void;
  onSelect?: () => void;
}

export function RadioSection<T extends string>({
  name,
  title,
  options,
  value,
  onChange,
  onSelect,
}: RadioSectionProps<T>) {
  const handleChange = (v: T) => {
    onChange(v);
    onSelect?.();
  };

  return (
    <section className="space-y-4">
      <Text as="h2" variant="serif" className="text-lg tracking-wide border-b border-white/10 pb-2 text-white">
        {title}
      </Text>
      <div className="space-y-3">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center">
            <input
              type="radio"
              name={name}
              id={`${name}-${opt.value}`}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => handleChange(opt.value)}
              className="hidden radio-foundations"
            />
            <label
              htmlFor={`${name}-${opt.value}`}
              className="flex items-center cursor-pointer transition-colors duration-300 text-white"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              <span className="radio-circle w-4 h-4 rounded-full border border-white mr-4 shrink-0 bg-transparent transition-colors duration-300" />
              <span className="text-sm font-light tracking-widest uppercase">
                {opt.label}
              </span>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
