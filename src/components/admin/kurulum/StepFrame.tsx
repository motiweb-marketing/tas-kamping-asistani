interface StepFrameProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function StepFrame({ title, description, children }: StepFrameProps) {
  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-4 shadow-sm sm:p-8">
      <header className="mb-5 border-b border-forest-100 pb-4 sm:mb-6">
        <h2 className="font-display text-lg font-bold text-forest-950 sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-forest-600">{description}</p>
      </header>
      {children}
    </div>
  );
}
