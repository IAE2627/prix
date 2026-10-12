import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Suppression définitive d'un enregistrement (lignes de test, doublons). */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
  }

  const { count } = await prisma.response.deleteMany({ where: { id } });
  if (count === 0) {
    return NextResponse.json({ error: 'Enregistrement introuvable.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
