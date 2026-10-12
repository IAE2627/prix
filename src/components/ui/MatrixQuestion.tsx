'use client';

import type { ReactNode } from 'react';

export interface MatrixRow {
  key: string;
  /** Contenu de l'en-tête de ligne (texte ou champ de saisie). */
  label: ReactNode;
  /** Libellé texte de la ligne pour les lecteurs d'écran. */
  ariaLabel: string;
  invalid?: boolean;
}

interface MatrixQuestionProps<T extends string> {
  name: string;
  rowHeader: string;
  rows: MatrixRow[];
  columns: readonly { value: T; label: string }[];
  values: Record<string, T | null>;
  onChange: (rowKey: string, value: T) => void;
}

/** Matrice à choix unique par ligne : tableau sur grand écran, cartes empilées sur mobile. */
export function MatrixQuestion<T extends string>({
  name,
  rowHeader,
  rows,
  columns,
  values,
  onChange,
}: MatrixQuestionProps<T>) {
  return (
    <>
      <div className="hidden sm:block">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th scope="col" className="pb-2 text-left font-medium text-slate-500">
                {rowHeader}
              </th>
              {columns.map((column) => (
                <th key={column.value} scope="col" className="w-24 px-1 pb-2 text-center font-medium text-slate-600">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={row.invalid ? 'bg-red-50' : 'odd:bg-slate-50'}>
                <th scope="row" className="rounded-l-lg px-3 py-2.5 text-left font-medium text-slate-800">
                  {row.label}
                </th>
                {columns.map((column, index) => (
                  <td
                    key={column.value}
                    className={`text-center ${index === columns.length - 1 ? 'rounded-r-lg' : ''}`}
                  >
                    <label className="flex cursor-pointer items-center justify-center py-2.5">
                      <input
                        type="radio"
                        name={`${name}-table-${row.key}`}
                        checked={values[row.key] === column.value}
                        onChange={() => onChange(row.key, column.value)}
                        aria-label={`${row.ariaLabel} : ${column.label}`}
                        className="h-4 w-4"
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`rounded-xl border p-3 ${row.invalid ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
          >
            <div className="text-sm font-semibold text-slate-800">{row.label}</div>
            <div role="radiogroup" aria-label={row.ariaLabel} className="mt-2 grid grid-cols-2 gap-2">
              {columns.map((column) => {
                const checked = values[row.key] === column.value;
                return (
                  <label
                    key={column.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs ${
                      checked ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${name}-cards-${row.key}`}
                      checked={checked}
                      onChange={() => onChange(row.key, column.value)}
                      className="h-4 w-4 shrink-0"
                    />
                    <span>{column.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
