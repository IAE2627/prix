'use client';

import { CRITERIA, RANK_LABELS, type CriterionKey, type Ranking } from '@/lib/survey';

interface RankingMatrixProps {
  value: Ranking;
  onChange: (value: Ranking) => void;
}

/**
 * Matrice de classement : au plus une case par ligne (critère) et par colonne (rang).
 * `value[i]` contient le critère classé au rang i + 1, ce qui rend la contrainte
 * « une case par colonne » structurelle ; la contrainte « une case par ligne » est
 * assurée en retirant le critère de son ancien rang avant de le replacer.
 */
export function RankingMatrix({ value, onChange }: RankingMatrixProps) {
  const toggle = (criterion: CriterionKey, rankIndex: number) => {
    const next = [...value] as Ranking;
    if (next[rankIndex] === criterion) {
      next[rankIndex] = null;
    } else {
      for (let i = 0; i < next.length; i++) {
        if (next[i] === criterion) next[i] = null;
      }
      next[rankIndex] = criterion;
    }
    onChange(next);
  };

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          <th scope="col" className="pb-2 text-left font-medium text-slate-500">
            Critère
          </th>
          {RANK_LABELS.map((label) => (
            <th key={label} scope="col" className="w-16 px-1 pb-2 text-center align-bottom font-medium text-slate-600 sm:w-28">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {CRITERIA.map((criterion) => {
          const selected = value.includes(criterion.key);
          return (
            <tr key={criterion.key} className={selected ? 'bg-emerald-50' : 'odd:bg-slate-50'}>
              <th scope="row" className="rounded-l-lg px-3 py-1 text-left font-medium text-slate-800">
                {criterion.label}
              </th>
              {RANK_LABELS.map((label, rankIndex) => (
                <td key={label} className={`text-center ${rankIndex === RANK_LABELS.length - 1 ? 'rounded-r-lg' : ''}`}>
                  <label className="flex cursor-pointer items-center justify-center py-2.5">
                    <input
                      type="checkbox"
                      checked={value[rankIndex] === criterion.key}
                      onChange={() => toggle(criterion.key, rankIndex)}
                      aria-label={`${criterion.label} : ${label}`}
                      className="h-5 w-5"
                    />
                  </label>
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
