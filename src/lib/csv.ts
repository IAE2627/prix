import type { Response } from '@prisma/client';
import { CRITERIA } from './survey';

const SEPARATOR = ';';
const BOM = '﻿';

type Cell = string | number | boolean | Date | null | undefined;

function formatCell(value: Cell): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);

  // Neutralise les formules (=, +, -, @) dans les champs de texte libre ouverts sous Excel.
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rankOf(row: Response, criterion: string): number | null {
  if (row.q6Rang1 === criterion) return 1;
  if (row.q6Rang2 === criterion) return 2;
  if (row.q6Rang3 === criterion) return 3;
  return null;
}

const COLUMNS: { header: string; value: (row: Response) => Cell }[] = [
  { header: 'id', value: (r) => r.id },
  { header: 'respondent_id', value: (r) => r.respondentId },
  { header: 'status', value: (r) => r.status },
  { header: 'assigned_version', value: (r) => r.assignedVersion },
  { header: 'is_valid_manipulation', value: (r) => r.isValidManipulation },
  { header: 'started_at', value: (r) => r.startedAt },
  { header: 'submitted_at', value: (r) => r.submittedAt },
  { header: 'duration_seconds', value: (r) => r.durationSeconds },

  { header: 'q1_pratique_outdoor', value: (r) => r.q1Pratique },
  { header: 'q2_randonnee', value: (r) => r.q2Randonnee },
  { header: 'q2_trail', value: (r) => r.q2Trail },
  { header: 'q2_ski', value: (r) => r.q2Ski },
  { header: 'q2_alpinisme', value: (r) => r.q2Alpinisme },
  { header: 'q2_vtt', value: (r) => r.q2Vtt },
  { header: 'q2_nautique', value: (r) => r.q2Nautique },
  { header: 'q2_camping', value: (r) => r.q2Camping },
  { header: 'q2_autre', value: (r) => r.q2Autre },
  { header: 'q2_autre_texte', value: (r) => r.q2AutreTexte },
  { header: 'q3_sport_principal', value: (r) => r.q3SportPrincipal },
  { header: 'q3_sport_principal_libelle', value: (r) => r.q3SportLibelle },
  { header: 'q4_niveau', value: (r) => r.q4Niveau },

  { header: 'q5_achat_veste_technique', value: (r) => r.q5AchatVeste },
  { header: 'q5b_budget_derniere_veste', value: (r) => r.q5bBudget },
  { header: 'q6_rang1', value: (r) => r.q6Rang1 },
  { header: 'q6_rang2', value: (r) => r.q6Rang2 },
  { header: 'q6_rang3', value: (r) => r.q6Rang3 },
  // Une colonne par critère (rang 1 à 3, vide si non classé) pour l'analyse directe.
  ...CRITERIA.map((criterion) => ({
    header: `q6_rang_${criterion.key}`,
    value: (r: Response): Cell => (r.status === 'completed' ? rankOf(r, criterion.key) : null),
  })),

  { header: 'marque_connue', value: (r) => r.marqueConnue },

  { header: 'qp_fiabilite', value: (r) => r.qpFiabilite },
  { header: 'qp_fabrication', value: (r) => r.qpFabrication },
  { header: 'qp_qualite', value: (r) => r.qpQualite },
  { header: 'qp_confiance', value: (r) => r.qpConfiance },
  { header: 'qp_durabilite', value: (r) => r.qpDurabilite },

  { header: 'vw_m5_trop_bon_marche', value: (r) => r.vwTropBonMarche },
  { header: 'vw_m6_bonne_affaire', value: (r) => r.vwBonneAffaire },
  { header: 'vw_m7_cher', value: (r) => r.vwCher },
  { header: 'vw_m8_trop_cher', value: (r) => r.vwTropCher },

  { header: 'gg_99', value: (r) => r.gg99 },
  { header: 'gg_129', value: (r) => r.gg129 },
  { header: 'gg_179', value: (r) => r.gg179 },
  { header: 'gg_195', value: (r) => r.gg195 },
  { header: 'gg_239', value: (r) => r.gg239 },
  { header: 'gg_259', value: (r) => r.gg259 },
  { header: 'gg_ordre_affichage', value: (r) => r.ggOrdre },

  { header: 'manipulation_check', value: (r) => r.manipCheck },

  { header: 'genre', value: (r) => r.genre },
  { header: 'age', value: (r) => r.age },
  { header: 'situation', value: (r) => r.situation },
  { header: 'budget_loisirs_mensuel', value: (r) => r.budgetLoisirs },
];

/** CSV UTF-8 avec BOM, séparateur point-virgule, fins de ligne CRLF. */
export function responsesToCsv(rows: Response[]): string {
  const lines = [
    COLUMNS.map((column) => column.header).join(SEPARATOR),
    ...rows.map((row) => COLUMNS.map((column) => formatCell(column.value(row))).join(SEPARATOR)),
  ];
  return BOM + lines.join('\r\n') + '\r\n';
}
