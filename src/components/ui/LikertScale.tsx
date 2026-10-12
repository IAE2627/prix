'use client';

import { LIKERT_MAX_LABEL, LIKERT_MIN_LABEL } from '@/lib/survey';

interface LikertScaleProps {
  name: string;
  value: number | null;
  onChange: (value: number) => void;
}

const POINTS = [1, 2, 3, 4, 5];

export function LikertScale({ name, value, onChange }: LikertScaleProps) {
  return (
    <div>
      <div role="radiogroup" className="grid grid-cols-5 gap-2">
        {POINTS.map((point) => {
          const checked = value === point;
          return (
            <label
              key={point}
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-semibold transition ${
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
                aria-label={
                  point === 1 ? `1, ${LIKERT_MIN_LABEL}` : point === 5 ? `5, ${LIKERT_MAX_LABEL}` : String(point)
                }
                className="h-4 w-4"
              />
              {point}
            </label>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>1 = {LIKERT_MIN_LABEL}</span>
        <span className="text-right">5 = {LIKERT_MAX_LABEL}</span>
      </div>
    </div>
  );
}
