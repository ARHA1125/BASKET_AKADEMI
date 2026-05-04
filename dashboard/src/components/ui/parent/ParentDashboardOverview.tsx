'use client';

import { getToken } from '@/lib/auth';
import { PlayerCard } from '@/components/ui/admin/PlayerCard';
import { GamificationSummary, PlayerAssessment, Student, StudentBadge } from '@/types/academic';
import { Calendar, CreditCard, Crown, MessageCircle, Shield, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ChildSummary = {
  student: Student;
  latestAssessment: PlayerAssessment | null;
  assessments: PlayerAssessment[];
  badges: StudentBadge[];
  gamification: GamificationSummary;
  leaderboard: {
    ageClass?: string;
    currentRank: number | null;
    weeklyPoints: number;
    totalPlayers: number;
  };
};

const BADGE_THEME: Record<string, { icon: any; accent: string; bg: string; animation: string }> = {
  lineup_selected: { icon: Crown, accent: 'text-amber-300', bg: 'from-amber-500/20 via-yellow-400/15 to-amber-700/20', animation: 'animate-pulse' },
  match_ready: { icon: Trophy, accent: 'text-rose-300', bg: 'from-rose-500/20 via-orange-400/10 to-rose-700/20', animation: 'animate-bounce' },
  training_engine: { icon: Zap, accent: 'text-cyan-300', bg: 'from-cyan-500/20 via-sky-400/10 to-cyan-700/20', animation: 'animate-pulse' },
  skill_mastery: { icon: Sparkles, accent: 'text-violet-300', bg: 'from-violet-500/20 via-fuchsia-400/10 to-violet-700/20', animation: 'animate-pulse' },
  discipline_lock: { icon: Shield, accent: 'text-emerald-300', bg: 'from-emerald-500/20 via-teal-400/10 to-emerald-700/20', animation: 'animate-pulse' },
  team_spirit: { icon: Users, accent: 'text-blue-300', bg: 'from-blue-500/20 via-indigo-400/10 to-blue-700/20', animation: 'animate-pulse' },
};

type ParentSummaryResponse = {
  parent: {
    id: string;
    user: {
      fullName: string;
      email: string;
    };
  };
  children: ChildSummary[];
};

export function ParentDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ParentSummaryResponse | null>(null);
  const [activeChildIndex, setActiveChildIndex] = useState(0);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/me/children/performance`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load parent dashboard');
        }

        setSummary(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const activeChild = useMemo(() => {
    if (!summary?.children?.length) return null;
    return summary.children[activeChildIndex] || summary.children[0];
  }, [activeChildIndex, summary?.children]);

  const latest = activeChild?.latestAssessment;
  const achievements = activeChild?.gamification?.categories || [];
  const featuredBadge = activeChild?.gamification?.featuredBadge;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Parent Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading your children progress...' : 'Monitor FUT progress, attendance-driven momentum, and rankings.'}
          </p>
        </div>

        {summary?.children?.length ? (
          <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
            {summary.children.map((child, index) => (
              <button
                key={child.student.id}
                onClick={() => setActiveChildIndex(index)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeChildIndex === index
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {child.student.user.fullName}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 p-6 shadow-sm dark:border-slate-800 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading child FUT summary...</p>
            ) : latest ? (
              <div className="space-y-4">
                <PlayerCard
                  name={activeChild?.student.user.fullName || 'Player'}
                  position={activeChild?.student.position || 'ATH'}
                  ovr={String(latest.overallRating)}
                  subtitle={`${activeChild?.student.ageClass || '-'} · ${activeChild?.student.curriculumProfile || '-'}`}
                  stats={{
                    spd: latest.speedScore,
                    sho: latest.shootingScore,
                    pas: latest.passingScore,
                    dri: latest.dribblingScore,
                    def: latest.defenseScore,
                    phy: latest.physicalScore,
                  }}
                  theme="gold"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No FUT assessment available yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            <div className="mt-4 space-y-2 text-sm">
              <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
                <MessageCircle size={16} /> Chat with Coach
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
                <Calendar size={16} /> Request Leave
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
                <CreditCard size={16} /> Review Payment Status
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white">Progress Snapshot</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Current Rank</div>
                <div className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">{activeChild?.leaderboard?.currentRank ? `#${activeChild.leaderboard.currentRank}` : '-'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Points</div>
                <div className="mt-1 text-2xl font-bold text-amber-500 dark:text-amber-300">{activeChild?.gamification?.totalPoints || 0}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Cohort</div>
                <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{activeChild?.leaderboard?.ageClass || '-'}</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-200/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white dark:border-amber-500/20">
              <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Featured Trophy</div>
              <div className="mt-2 text-lg font-semibold">{featuredBadge?.title || 'No featured trophy yet'}</div>
              <div className="mt-1 text-sm text-slate-300">{featuredBadge?.description || 'Your child will unlock a featured trophy once any category reaches Tier 1.'}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Trophy className="h-4 w-4 text-amber-500" /> Assessment History
            </h3>
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
                  {activeChild?.assessments?.slice(0, 10).map((assessment) => (
                    <tr key={assessment.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2">{assessment.weekMaterial?.category || '-'}</td>
                      <td className="px-3 py-2">{assessment.score}/5</td>
                      <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{assessment.overallRating}</td>
                      <td className="px-3 py-2">{new Date(assessment.assessedAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                  {!activeChild?.assessments?.length && !loading && (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>No child assessment history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white">Trophy Categories</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {achievements.map((item) => {
                const theme = BADGE_THEME[item.badge.categoryKey || 'team_spirit'] || BADGE_THEME.team_spirit;
                const Icon = theme.icon;

                return (
                <div key={item.badge.badgeCode} className={`rounded-xl border px-4 py-4 ${item.badge.unlocked ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40' : 'border-dashed border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-950/20'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full bg-gradient-to-br ${theme.bg} p-3 ${theme.accent}`}>
                      <Icon className={`h-5 w-5 ${item.badge.unlocked ? theme.animation : ''}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{item.badge.title}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tier {item.badge.tier || 0}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.badge.description}</div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" style={{ width: `${Math.min(((item.badge.progressPoints || 0) / Math.max(item.badge.targetPoints || 1, 1)) * 100, 100)}%` }} />
                      </div>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.badge.progressPoints || 0} / {item.badge.targetPoints || 0} pts</div>
                    </div>
                  </div>
                </div>
              )})}
              {!achievements.length && !loading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No trophy categories visible yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
