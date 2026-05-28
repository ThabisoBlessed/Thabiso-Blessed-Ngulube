interface SectionHeaderProps {
  label: string; title: string; subtitle?: string;
}
export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="h-px w-6 bg-brand" />
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{label}</span>
        <span className="h-px w-6 bg-brand" />
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}
