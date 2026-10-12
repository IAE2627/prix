import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface QuestionBlockProps {
  title: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-medium text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function QuestionBlock({ title, hint, error, children }: QuestionBlockProps) {
  return (
    <section
      data-invalid={error ? 'true' : undefined}
      className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
        error ? 'border-red-300' : 'border-slate-200'
      }`}
    >
      <h3 className="text-base font-semibold leading-snug text-slate-900">{title}</h3>
      {hint && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{hint}</p>}
      <div className="mt-4">{children}</div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </section>
  );
}
