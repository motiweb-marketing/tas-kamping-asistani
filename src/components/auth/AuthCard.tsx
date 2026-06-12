interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-forest-600">{subtitle}</p>}
      </header>
      {children}
      {footer && <div className="mt-8 border-t border-forest-100 pt-6">{footer}</div>}
    </div>
  );
}
