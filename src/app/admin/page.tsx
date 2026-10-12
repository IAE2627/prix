import type { Metadata } from 'next';
import type { Response } from '@prisma/client';
import { Download } from 'lucide-react';
import { isAdminAuthenticated, isAdminConfigured } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GENDERS, LEVELS, PRICE, SCALE_MANIP, labelOf } from '@/lib/survey';
import { DeleteButton } from './DeleteButton';
import { LoginForm } from './LoginForm';
import { LogoutButton } from './LogoutButton';

export const metadata: Metadata = { title: 'Administration · Étude veste outdoor' };
export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  completed: { label: 'Complet', className: 'bg-emerald-100 text-emerald-900' },
  // Ancien statut (avant que Q1 = Non ne poursuive le questionnaire).
  screened_out_q1: { label: 'Screen-out Q1', className: 'bg-slate-200 text-slate-700' },
  screened_out_q2: { label: 'Screen-out Q2', className: 'bg-slate-200 text-slate-700' },
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Paris',
});

function mean(values: (number | null)[]): string {
  const numbers = values.filter((value): value is number => value !== null);
  if (numbers.length === 0) return '–';
  return (numbers.reduce((sum, value) => sum + value, 0) / numbers.length).toFixed(2).replace('.', ',');
}

/** Score de qualité perçue : moyenne des 5 items, null si la réponse est antérieure à cette échelle. */
function qualityScore(row: Response): number | null {
  const items = [row.qpFiabilite, row.qpFabrication, row.qpQualite, row.qpConfiance, row.qpDurabilite];
  if (items.some((item) => item === null)) return null;
  return items.reduce<number>((sum, item) => sum + (item ?? 0), 0) / items.length;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min ${String(seconds % 60).padStart(2, '0')} s`;
}

function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}

function VersionSummary({ version, rows }: { version: string; rows: Response[] }) {
  const valid = rows.filter((row) => row.isValidManipulation === true);
  return (
    <tr className="border-t border-slate-200">
      <th scope="row" className="px-4 py-2.5 text-left font-semibold">
        Version {version}
      </th>
      <td className="px-4 py-2.5 text-right tabular-nums">{rows.length}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{valid.length}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{mean(rows.map(qualityScore))}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{mean(valid.map(qualityScore))}</td>
    </tr>
  );
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return <LoginForm configured={isAdminConfigured()} />;
  }

  const rows = await prisma.response.findMany({ orderBy: { id: 'desc' } });
  const completed = rows.filter((row) => row.status === 'completed');
  const screenedOut = rows.length - completed.length;
  const versionA = completed.filter((row) => row.assignedVersion === 'A');
  const versionB = completed.filter((row) => row.assignedVersion === 'B');
  const validManipulation = completed.filter((row) => row.isValidManipulation === true).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Étude veste outdoor · Administration</h1>
          <p className="mt-1 text-sm text-slate-600">
            {rows.length} enregistrement{rows.length > 1 ? 's' : ''} en base.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/admin/export"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" aria-hidden />
            Télécharger le CSV complet
          </a>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Questionnaires complets" value={completed.length} />
        <StatCard label="Screen-outs" value={screenedOut} detail="Q2 tout à « Jamais »" />
        <StatCard label={`Version A (${PRICE} €)`} value={versionA.length} />
        <StatCard label="Version B (promotion)" value={versionB.length} />
        <StatCard
          label="Manipulation check valide"
          value={validManipulation}
          detail={
            completed.length > 0 ? `${Math.round((validManipulation / completed.length) * 100)} % des complets` : undefined
          }
        />
      </div>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-semibold text-slate-900">
            Comparaison A/B (questionnaires complets ; qualité perçue = moyenne des 5 items, de 1 à 5)
          </caption>
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-2.5 text-left font-medium">Condition</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">n</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">n valides</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Qualité perçue moy.</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Qualité perçue moy. (valides)</th>
            </tr>
          </thead>
          <tbody>
            <VersionSummary version="A" rows={versionA} />
            <VersionSummary version="B" rows={versionB} />
          </tbody>
        </table>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full whitespace-nowrap text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-semibold text-slate-900">
            Réponses (les plus récentes en premier). Toutes les variables sont dans l&apos;export CSV.
          </caption>
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              {[
                'ID',
                'Action',
                'Date',
                'Statut',
                'Version',
                'Manip. check',
                'Valide',
                'Sport principal',
                'Niveau',
                'Qualité perçue',
                'VW (M5 / M6 / M7 / M8)',
                'Genre',
                'Âge',
                'Durée',
              ].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-2.5 text-left font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={14} className="px-4 py-10 text-center text-slate-500">
                  Aucune réponse enregistrée pour le moment.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const status = STATUS_LABELS[row.status] ?? { label: row.status, className: 'bg-slate-200' };
              return (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 tabular-nums text-slate-500">{row.id}</td>
                  <td className="px-4 py-2.5">
                    <DeleteButton id={row.id} />
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">{dateFormat.format(row.submittedAt)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold">{row.assignedVersion}</td>
                  <td className="px-4 py-2.5">
                    {row.manipCheckScore !== null
                      ? `${row.manipCheckScore} · ${SCALE_MANIP[row.manipCheckScore - 1]}`
                      : (row.manipCheck ?? '–')}
                  </td>
                  <td className="px-4 py-2.5">
                    {row.isValidManipulation === null ? (
                      '–'
                    ) : row.isValidManipulation ? (
                      <span className="font-semibold text-emerald-700">Oui</span>
                    ) : (
                      <span className="font-semibold text-red-700">Non</span>
                    )}
                  </td>
                  <td className="max-w-48 truncate px-4 py-2.5">{row.q3SportLibelle ?? '–'}</td>
                  <td className="px-4 py-2.5">{labelOf(LEVELS, row.q4Niveau) || '–'}</td>
                  <td className="px-4 py-2.5 tabular-nums">{mean([qualityScore(row)])}</td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {row.vwTropBonMarche === null
                      ? '–'
                      : `${row.vwTropBonMarche} / ${row.vwBonneAffaire} / ${row.vwCher} / ${row.vwTropCher} €`}
                  </td>
                  <td className="px-4 py-2.5">{labelOf(GENDERS, row.genre) || '–'}</td>
                  <td className="px-4 py-2.5 tabular-nums">{row.age ?? '–'}</td>
                  <td className="px-4 py-2.5 tabular-nums">{formatDuration(row.durationSeconds)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
