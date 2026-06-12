import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function AuthButton({
  children,
  loading,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: AuthButtonProps) {
  const base =
    'inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-base font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-forest-800 text-white shadow-md hover:bg-forest-900 hover:shadow-lg'
      : 'border border-forest-200 bg-white text-forest-800 hover:bg-forest-50';

  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}
