interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'info';
}

const toneStyles = {
  default: 'border-gray-200 bg-white text-gray-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export default function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border-2 p-4 shadow-sm ${toneStyles[tone]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
    </div>
  );
}
