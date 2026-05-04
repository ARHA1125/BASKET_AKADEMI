'use client';

import { getToken } from '@/lib/auth';
import { PlayerAssessment, Student, StudentActivity } from '@/types/academic';
import { useEffect, useMemo, useState } from 'react';

export function StudentPerformanceView() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<PlayerAssessment | null>(null);
  const [assessments, setAssessments] = useState<PlayerAssessment[]>([]);
  const [recentActivities, setRecentActivities] = useState<StudentActivity[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ ageClass?: string; currentRank: number | null; weeklyPoints: number; totalPlayers: number } | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/me/performance`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load student performance');
        }

        const json = await res.json();
        setStudent(json.student || null);
        setLatestAssessment(json.latestAssessment || null);
        setAssessments(Array.isArray(json.assessments) ? json.assessments : []);
        setRecentActivities(Array.isArray(json.recentActivities) ? json.recentActivities : []);
        setLeaderboard(json.leaderboard || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const currentRank = useMemo(() => {
    return leaderboard?.currentRank || null;
  }, [leaderboard]);

  const statCards = latestAssessment ? [
    ['SPD', latestAssessment.speedScore],
    ['SHO', latestAssessment.shootingScore],
    ['PAS', latestAssessment.passingScore],
    ['DRI', latestAssessment.dribblingScore],
    ['DEF', latestAssessment.defenseScore],
    ['PHY', latestAssessment.physicalScore],
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">My Performance</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Curriculum-based FUT card with cumulative gamification momentum and weekly leaderboard snapshot.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 p-6 shadow-sm dark:border-slate-800 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading FUT card...</p>
          ) : latestAssessment ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-5xl font-extrabold text-slate-900 dark:text-white">{latestAssessment.overallRating}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">OVR</div>
                </div>
                <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
                  {student?.ageClass || '-'}
                </div>
              </div>

              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{student?.user.fullName}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{student?.curriculumProfile || '-'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {statCards.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-950/40">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Latest competency</div>
                <div className="mt-1 font-medium text-slate-900 dark:text-white">{latestAssessment.weekMaterial?.category || '-'}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300">{latestAssessment.weekMaterial?.materialDescription || '-'}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No assessment available yet.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Ranking</h2>
            {loading ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading leaderboard...</p>
            ) : currentRank ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Current Rank</div>
                  <div className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">#{currentRank}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Cohort</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{leaderboard?.ageClass || '-'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Weekly Points</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{leaderboard?.weeklyPoints || 0}</div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No weekly ranking available yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Assessment History</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Competency</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">OVR</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.slice(0, 10).map((assessment) => (
                    <tr key={assessment.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2">{assessment.weekMaterial?.category || '-'}</td>
                      <td className="px-3 py-2">{assessment.score}/5</td>
                      <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{assessment.overallRating}</td>
                      <td className="px-3 py-2">{new Date(assessment.assessedAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                  {assessments.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>No performance history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Activity</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.slice(0, 10).map((activity) => (
                    <tr key={activity.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2">{activity.title}</td>
                      <td className="px-3 py-2">{activity.activityType}</td>
                      <td className="px-3 py-2">{new Date(activity.createdAt).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {recentActivities.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan={3}>No recent activity yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
