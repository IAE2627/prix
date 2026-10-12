'use client';

interface RadioListProps<T extends string> {
  name: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
}

const GRID: Record<1 | 2 | 3 | 4, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export function RadioList<T extends string>({ name, options, value, onChange, columns = 1 }: RadioListProps<T>) {
  return (
    <div role="radiogroup" className={`grid gap-2 ${GRID[columns]}`}>
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
              checked
                ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700'
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 shrink-0"
            />
            <span className="text-slate-800">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
