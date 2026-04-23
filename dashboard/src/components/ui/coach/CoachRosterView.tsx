'use client';

import { useCommunity } from '@/hooks/use-academic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function CoachRosterView() {
  const { loading, fetchSquads, finalizeSquad } = useCommunity();
  const [squads, setSquads] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      setSquads(await fetchSquads());
    };
    run();
  }, [fetchSquads]);

  const refresh = async () => setSquads(await fetchSquads());

  const handleFinalize = async (squadId: string) => {
    const result = await finalizeSquad({ squadId, isFinalized: true, awardedBy: 'coach-dashboard' });
    if (result) {
      toast.success('Roster finalized and event participation points awarded');
      await refresh();
    } else {
      toast.error('Failed to finalize roster');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Team Roster</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review squad composition and finalize event rosters.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {squads.map((squad) => (
          <div key={squad.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{squad.name}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{squad.event?.name || '-'} · Coach: {squad.coachName || '-'} · {squad.status}</p>
              </div>
              <button onClick={() => handleFinalize(squad.id)} disabled={loading || squad.isFinalized} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800">
                {squad.isFinalized ? 'Finalized' : 'Finalize'}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(squad.players || []).map((player: any) => (
                <span key={player.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{player.user?.fullName || 'Player'}</span>
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Created {new Date(squad.createdAt).toLocaleString('id-ID')}
              {squad.finalizedAt ? ` · Finalized ${new Date(squad.finalizedAt).toLocaleString('id-ID')}` : ''}
            </div>
          </div>
        ))}

        {!squads.length && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 xl:col-span-2">
            No rosters available yet.
          </div>
        )}
      </div>
    </div>
  );
}
