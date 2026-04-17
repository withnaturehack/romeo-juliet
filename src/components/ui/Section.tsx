import { Text } from "./Text";

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className = "" }: SectionProps) {
  return (
    <section className={`space-y-3 ${className}`}>
      <Text as="h2" variant="sectionTitle">
        {title}
      </Text>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
