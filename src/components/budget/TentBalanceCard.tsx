import type { BudgetTentBalance } from '@/types';

interface TentBalanceCardProps {
  balance: BudgetTentBalance;
}

const statusConfig = {
  alacakli: { label: 'Alacaklı', bg: 'bg-green-100', text: 'text-green-800' },
  borclu: { label: 'Borçlu', bg: 'bg-red-100', text: 'text-red-800' },
  denk: { label: 'Denk', bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function TentBalanceCard({ balance }: TentBalanceCardProps) {
  const config = statusConfig[balance.status];

  return (
    <div className={`rounded-xl border-2 p-4 ${config.bg}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">⛺ {balance.tent.name}</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${config.text}`}>
          {config.label}
        </span>
      </div>
      <div className="mt-3 space-y-1 text-base">
        <p>Üye: {balance.member_count} kişi ({balance.total_shares} pay)</p>
        <p>Harcaması gereken: {balance.expected_contribution.toFixed(2)} ₺</p>
        <p>Ödediği: {balance.actual_spent.toFixed(2)} ₺</p>
        <p className={`font-bold ${config.text}`}>
          Bakiye: {balance.balance > 0 ? '+' : ''}{balance.balance.toFixed(2)} ₺
        </p>
      </div>
    </div>
  );
}
