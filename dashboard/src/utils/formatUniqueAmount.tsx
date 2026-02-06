export function formatUniqueAmount(
  baseAmount: number,
  uniqueCode?: number
): {
  baseAmount: string;
  uniqueAmount: string;
  uniqueCode: string;
} {
  const formattedBase = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(baseAmount);

  if (!uniqueCode) {
    return {
      baseAmount: formattedBase,
      uniqueAmount: formattedBase,
      uniqueCode: '000',
    };
  }

  const totalAmount = baseAmount + uniqueCode;
  const formattedUnique = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(totalAmount);

  return {
    baseAmount: formattedBase,
    uniqueAmount: formattedUnique,
    uniqueCode: String(uniqueCode).padStart(3, '0'),
  };
}

export function UniqueAmountDisplay({
  baseAmount,
  uniqueCode,
  size = 'md',
}: {
  baseAmount: number;
  uniqueCode?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  if (!uniqueCode) {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(baseAmount);
    return <span className={sizeClasses[size]}>{formatted}</span>;
  }
  
  const totalAmount = Number(baseAmount) + Number(uniqueCode);
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(totalAmount);
  
  return (
    <span className={`font-bold ${sizeClasses[size]}`}>
      <span className="text-slate-700 dark:text-slate-300">
        {formattedTotal.slice(0, -3)}
      </span>
      <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">
        {formattedTotal.slice(-3)}
      </span>
    </span>
  );
}
