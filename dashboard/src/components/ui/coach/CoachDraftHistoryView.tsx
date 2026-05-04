'use client';

import { useCommunity } from '@/hooks/use-academic';
import { useEffect, useState } from 'react';

export function CoachDraftHistoryView() {
  const { fetchSquads } = useCommunity();
  const [squads, setSquads] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const data = await fetchSquads();
      setSquads(Array.isArray(data) ? data : []);
    };
    run();
  }, [fetchSquads]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Draft History</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Read-only history of created squads and finalized selections.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Squad</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Coach</th>
                <th className="px-3 py-2">Players</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Finalized</th>
              </tr>
            </thead>
            <tbody>
              {squads.map((squad) => (
                <tr key={squad.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-3">{squad.name}</td>
                  <td className="px-3 py-3">{squad.event?.name || '-'}</td>
                  <td className="px-3 py-3">{squad.coachName || '-'}</td>
                  <td className="px-3 py-3">{squad.players?.length || 0}</td>
                  <td className="px-3 py-3">{squad.status || (squad.isFinalized ? 'FINALIZED' : 'DRAFT')}</td>
                  <td className="px-3 py-3">{squad.createdAt ? new Date(squad.createdAt).toLocaleString('id-ID') : '-'}</td>
                  <td className="px-3 py-3">{squad.finalizedAt ? new Date(squad.finalizedAt).toLocaleString('id-ID') : '-'}</td>
                </tr>
              ))}
              {!squads.length && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={7}>No draft history available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
