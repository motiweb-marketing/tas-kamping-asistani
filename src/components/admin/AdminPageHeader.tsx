interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export default function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-2xl font-bold text-forest-950">{title}</h1>
      {description && <p className="mt-1 text-sm text-forest-600">{description}</p>}
    </header>
  );
}
