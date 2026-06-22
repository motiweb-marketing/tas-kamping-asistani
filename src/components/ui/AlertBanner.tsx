import Link from 'next/link';

interface AlertBannerProps {
  title: string;
  message: string;
  tone?: 'info' | 'warning' | 'success';
  href?: string;
  linkLabel?: string;
}

const tones = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
};

export default function AlertBanner({
  title,
  message,
  tone = 'info',
  href,
  linkLabel = 'Git →',
}: AlertBannerProps) {
  return (
    <div className={`rounded-2xl border-2 p-4 ${tones[tone]}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
      {href && (
        <Link
          href={href}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-white/80 px-4 text-sm font-semibold shadow-sm"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
