interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function SectionCard({ title, subtitle, children, action }: SectionCardProps) {
  return (
    <section className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-600">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
