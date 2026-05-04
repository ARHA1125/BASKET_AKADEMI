'use client';

import { getToken } from '@/lib/auth';
import { PlayerCard } from '@/components/ui/admin/PlayerCard';
import { GamificationSummary, PlayerAssessment, Student, StudentActivity, StudentBadge } from '@/types/academic';
import { Activity, Calendar, ChevronRight, Crown, Shield, Sparkles, Star, Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SummaryResponse = {
  student: Student;
  latestAssessment: PlayerAssessment | null;
  assessments: PlayerAssessment[];
  recentActivities: StudentActivity[];
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

export function StudentDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/me/performance`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load student dashboard');
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

  const student = summary?.student;
  const latest = summary?.latestAssessment;
  const gamification = summary?.gamification;
  const achievements = gamification?.categories || [];
  const featuredBadge = gamification?.featuredBadge;
  const dominantStat = latest?.dominantStat || latest?.weekMaterial?.statDomain || '-';

  const featuredTheme = useMemo(() => {
    if (!featuredBadge?.categoryKey) return BADGE_THEME.lineup_selected;
    return BADGE_THEME[featuredBadge.categoryKey] || BADGE_THEME.lineup_selected;
  }, [featuredBadge]);

  const compactActivities = useMemo(() => {
    return (summary?.recentActivities || []).slice(0, 3);
  }, [summary?.recentActivities]);

  const quickStats = useMemo(() => {
    return [
      {
        label: 'Weekly Rank',
        value: summary?.leaderboard?.currentRank ? `#${summary.leaderboard.currentRank}` : '-',
        tone: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Total Points',
        value: `${gamification?.totalPoints || 0}`,
        tone: 'text-amber-500 dark:text-amber-300',
      },
      {
        label: 'Recent OVR',
        value: latest?.overallRating ? String(latest.overallRating) : '-',
        tone: 'text-slate-900 dark:text-white',
      },
      {
        label: 'Dominant Stat',
        value: dominantStat,
        tone: 'text-violet-600 dark:text-violet-300',
      },
    ];
  }, [dominantStat, gamification?.totalPoints, latest?.overallRating, summary?.leaderboard?.currentRank]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">My Career</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading your academy progress...' : `Welcome back, ${student?.user.fullName || 'Player'}.`}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 p-6 shadow-sm dark:border-slate-800 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading FUT snapshot...</p>
            ) : latest ? (
              <div className="space-y-4">
                <PlayerCard
                  name={student?.user.fullName || 'Player'}
                  position={student?.position || 'ATH'}
                  ovr={String(latest.overallRating)}
                  subtitle={`${student?.ageClass || '-'} · ${student?.curriculumProfile || '-'}`}
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
              <p className="text-sm text-slate-500 dark:text-slate-400">No FUT card available yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white">Featured Progress</h3>
            <div className={`mt-4 rounded-xl border border-amber-200/60 bg-gradient-to-br ${featuredTheme.bg} p-4 dark:border-amber-500/20`}>
              <div className="flex items-start gap-3">
                <div className={`rounded-full bg-slate-950/40 p-3 ${featuredTheme.accent}`}>
                  <featuredTheme.icon className={`h-5 w-5 ${featuredTheme.animation}`} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Featured Trophy</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{featuredBadge?.title || 'Keep stacking points'}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{featuredBadge?.description || 'Your strongest trophy will appear here once a category reaches Tier 1.'}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{stat.label}</div>
                  <div className={`mt-1 text-xl font-semibold ${stat.tone}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Calendar className="h-4 w-4 text-blue-600" />
                Current Competency Focus
              </h3>
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{latest?.weekMaterial?.category || 'No active focus yet'}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{latest?.weekMaterial?.materialDescription || 'Coach assessments will appear here once recorded.'}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  Recent Activity
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Latest 3</span>
              </div>
              <div className="mt-4 space-y-2">
                {compactActivities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-100 px-3 py-3 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{activity.title}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activity.activityType}</div>
                      </div>
                      <div className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                        {new Date(activity.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}
                {!compactActivities.length && !loading && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No activity recorded yet.</p>
                )}
              </div>
              {!!summary?.recentActivities?.length && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Activity history is available in the performance page
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Trophy className="h-4 w-4 text-amber-500" />
              Trophy Cabinet
            </h3>
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
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Tier {item.badge.tier || 0}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.badge.description}</div>
                        <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"
                            style={{ width: `${Math.min(((item.badge.progressPoints || 0) / Math.max(item.badge.targetPoints || 1, 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {item.badge.progressPoints || 0} / {item.badge.targetPoints || 0} pts
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!achievements.length && !loading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No trophy progress available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
