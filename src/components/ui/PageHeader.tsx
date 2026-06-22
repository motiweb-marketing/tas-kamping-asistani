interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1.5 text-base text-gray-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
