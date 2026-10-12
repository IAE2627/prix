'use client';

interface RangeSliderProps {
  id: string;
  min: number;
  max: number;
  step?: number;
  /** null tant que le répondant n'a pas touché la réglette (aucune valeur par défaut enregistrée). */
  value: number | null;
  onChange: (value: number) => void;
  format: (value: number) => string;
  minLabel: string;
  maxLabel: string;
  ariaLabel: string;
}

export function RangeSlider({
  id,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
  minLabel,
  maxLabel,
  ariaLabel,
}: RangeSliderProps) {
  const touched = value !== null;
  const commit = (raw: string) => onChange(Number(raw));

  return (
    <div>
      <output
        htmlFor={id}
        className={`block text-center text-2xl font-bold tabular-nums ${
          touched ? 'text-emerald-800' : 'text-slate-400'
        }`}
      >
        {touched ? format(value) : 'Déplacez le curseur'}
      </output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        aria-label={ariaLabel}
        aria-valuetext={touched ? format(value) : 'Non renseigné'}
        onChange={(event) => commit(event.currentTarget.value)}
        // Un simple clic ou appui clavier sans déplacement compte aussi comme une réponse.
        onClick={(event) => commit(event.currentTarget.value)}
        onKeyUp={(event) => commit(event.currentTarget.value)}
        className={`mt-3 h-2 w-full cursor-pointer ${touched ? '' : 'opacity-60'}`}
      />
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
