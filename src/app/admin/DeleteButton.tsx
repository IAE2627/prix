'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';

export function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Supprimer définitivement la réponse n° ${id} ?\n\nCette action est irréversible : pensez à télécharger le CSV avant si vous avez un doute.`,
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/admin/responses/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        window.alert('La suppression a échoué. Rechargez la page puis réessayez.');
      }
    } catch {
      window.alert('La suppression a échoué. Vérifiez votre connexion.');
    }
    setBusy(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Supprimer la réponse n° ${id}`}
      title="Supprimer cette réponse"
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Trash2 className="h-3.5 w-3.5" aria-hidden />}
      Supprimer
    </button>
  );
}
