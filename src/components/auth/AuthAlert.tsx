interface AuthAlertProps {
  children: React.ReactNode;
  variant?: 'error' | 'info' | 'success';
}

export default function AuthAlert({ children, variant = 'error' }: AuthAlertProps) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-forest-200 bg-forest-50 text-forest-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };

  return (
    <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles[variant]}`} role="alert">
      {children}
    </p>
  );
}
