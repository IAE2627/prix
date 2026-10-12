'use client';

import type { ScaleLabels } from '@/lib/survey';

interface LikertScaleProps {
  name: string;
  /** Valeur enregistrée : 1 (premier libellé) à 5 (dernier libellé). */
  value: number | null;
  onChange: (value: number) => void;
  /** Intitulé affiché pour chacun des 5 points, à la place des chiffres. */
  labels: ScaleLabels;
}

/** Échelle en 5 points : libellés côte à côte sur grand écran, empilés sur mobile. */
export function LikertScale({ name, value, onChange, labels }: LikertScaleProps) {
  return (
    <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-5">
      {labels.map((label, index) => {
        const point = index + 1;
        const checked = value === point;
        return (
          <label
            key={label}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium leading-snug transition sm:flex-col sm:justify-start sm:gap-2 sm:px-2 sm:text-center sm:text-[13px] ${
              checked
                ? 'border-emerald-700 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={point}
              checked={checked}
              onChange={() => onChange(point)}
              className="h-4 w-4 shrink-0"
            />
            <span>{label}</span>
          </label>
        );
      })}
    </div>
  );
}
