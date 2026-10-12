import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { responsesToCsv } from '@/lib/csv';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const rows = await prisma.response.findMany({ orderBy: { id: 'asc' } });
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(responsesToCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="etude-veste-outdoor_${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
