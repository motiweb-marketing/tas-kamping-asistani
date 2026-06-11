'use client';

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
  placeholder?: string;
}

export default function ItemSearchInput({
  value,
  onChange,
  resultCount,
  totalCount,
  placeholder = 'Malzeme ara...',
}: ItemSearchInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base"
        autoComplete="off"
      />
      {value.trim() && totalCount !== undefined && resultCount !== undefined && (
        <p className="text-sm text-gray-500">
          {resultCount} / {totalCount} malzeme gösteriliyor
        </p>
      )}
    </div>
  );
}
