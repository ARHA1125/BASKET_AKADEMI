'use client';

import { PlayerCard } from '@/components/ui/admin/PlayerCard';
import { useStudentActivities } from '@/hooks/use-academic';
import { useEffect, useState } from 'react';

const AGE_CLASS_OPTIONS = ['', 'KU-10', 'KU-12', 'KU-14', 'KU-17'];

export function WeeklyLeaderboardView() {
  const { fetchWeeklyLeaderboard, loading } = useStudentActivities();
  const [ageClass, setAgeClass] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const data = await fetchWeeklyLeaderboard(ageClass || undefined);
      setLeaderboard(Array.isArray(data) ? data : []);
    };
    run();
  }, [ageClass, fetchWeeklyLeaderboard]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Weekly Top Player</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track weekly gamification rankings by age class.</p>
        </div>
        <select value={ageClass} onChange={(e) => setAgeClass(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          {AGE_CLASS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option || 'All age classes'}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {leaderboard.length > 0 && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <div key={entry.studentId} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {index === 0 ? 'Top Player' : `Rank #${index + 1}`}
                </div>
                <PlayerCard
                  name={entry.fullName}
                  position={entry.ageClass?.replace('KU-', 'U') || 'ATH'}
                  ovr={String(entry.overallRating || 0)}
                  subtitle={`${entry.curriculumProfile?.replace('_', ' ') || entry.ageClass || '-'} · ${entry.weeklyPoints} PTS`}
                  stats={{
                    spd: entry.speedScore || 0,
                    sho: entry.shootingScore || 0,
                    pas: entry.passingScore || 0,
                    dri: entry.dribblingScore || 0,
                    def: entry.defenseScore || 0,
                    phy: entry.physicalScore || 0,
                  }}
                  theme={index === 0 ? 'gold' : index === 1 ? 'light' : 'dark'}
                />
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Age Class</th>
                <th className="px-3 py-2">Weekly Points</th>
                <th className="px-3 py-2">Highlight</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.studentId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">#{index + 1}</td>
                  <td className="px-3 py-3">{entry.fullName}</td>
                  <td className="px-3 py-3">{entry.ageClass || '-'}</td>
                  <td className="px-3 py-3 font-semibold text-blue-600 dark:text-blue-400">{entry.weeklyPoints}</td>
                  <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{index === 0 ? 'Top Player' : index < 3 ? 'Top 3' : '-'}</td>
                </tr>
              ))}
              {!loading && leaderboard.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={5}>No leaderboard entries for this week yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
