import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidManipulation, sportLabel } from '@/lib/survey';
import { submissionSchema, type Submission } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 20_000;

function toRow(data: Submission, submittedAt: Date) {
  const startedAt = new Date(data.startedAt);
  const common = {
    respondentId: data.respondentId,
    status: data.status,
    assignedVersion: data.version,
    startedAt,
    submittedAt,
    durationSeconds: Math.max(0, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000)),
    q1Pratique: data.q1,
  };

  if (data.status === 'screened_out_q1') return common;

  const frequencies = {
    q2Randonnee: data.q2.randonnee,
    q2Trail: data.q2.trail,
    q2Ski: data.q2.ski,
    q2Alpinisme: data.q2.alpinisme,
    q2Vtt: data.q2.vtt,
    q2Nautique: data.q2.nautique,
    q2Camping: data.q2.camping,
    q2Autre: data.q2.autre,
    q2AutreTexte: data.q2AutreText || null,
  };

  if (data.status === 'screened_out_q2') return { ...common, ...frequencies };

  return {
    ...common,
    ...frequencies,
    q3SportPrincipal: data.q3,
    q3SportLibelle: sportLabel(data.q3, data.q2AutreText),
    q4Niveau: data.q4,

    q5AchatVeste: data.q5,
    q5bBudget: data.q5b,
    q6Rang1: data.q6[0],
    q6Rang2: data.q6[1],
    q6Rang3: data.q6[2],

    marqueConnue: data.brandKnown,

    intentionAchat: data.intention,
    qualitePercue: data.qualite,
    promoQualite: data.promoQualite,
    recommandation: data.recommandation,

    vwTropBonMarche: data.vw.m5,
    vwBonneAffaire: data.vw.m6,
    vwCher: data.vw.m7,
    vwTropCher: data.vw.m8,

    gg99: data.gg['99'],
    gg129: data.gg['129'],
    gg179: data.gg['179'],
    gg199: data.gg['199'],
    gg239: data.gg['239'],
    gg259: data.gg['259'],
    ggOrdre: data.ggOrder.join('|'),

    manipCheck: data.manipCheck,
    // Recalculé côté serveur : le flag ne dépend jamais de ce qu'envoie le navigateur.
    isValidManipulation: isValidManipulation(data.version, data.manipCheck),

    genre: data.genre,
    age: data.age,
    situation: data.situation,
    budgetLoisirs: data.budget,
  };
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Requête trop volumineuse.' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Réponses invalides.',
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      },
      { status: 422 },
    );
  }

  const submittedAt = new Date();
  if (new Date(parsed.data.startedAt).getTime() > submittedAt.getTime() + 5 * 60 * 1000) {
    return NextResponse.json({ error: 'Date de début invalide.' }, { status: 422 });
  }

  try {
    // Idempotent : un double clic ou un nouvel essai réseau ne crée pas de doublon.
    await prisma.response.upsert({
      where: { respondentId: parsed.data.respondentId },
      create: toRow(parsed.data, submittedAt),
      update: {},
    });
  } catch (error) {
    console.error('Enregistrement de la réponse impossible', error);
    return NextResponse.json({ error: "L'enregistrement a échoué." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
