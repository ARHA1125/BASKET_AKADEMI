'use client';

import { getToken } from '@/lib/auth';
import { StudentBadge } from '@/types/academic';
import { Crown, Shield, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const BADGE_THEME: Record<string, { icon: any; accent: string; bg: string; animation: string }> = {
  lineup_selected: { icon: Crown, accent: 'text-amber-300', bg: 'from-amber-500/20 via-yellow-400/15 to-amber-700/20', animation: 'animate-pulse' },
  match_ready: { icon: Trophy, accent: 'text-rose-300', bg: 'from-rose-500/20 via-orange-400/10 to-rose-700/20', animation: 'animate-bounce' },
  training_engine: { icon: Zap, accent: 'text-cyan-300', bg: 'from-cyan-500/20 via-sky-400/10 to-cyan-700/20', animation: 'animate-pulse' },
  skill_mastery: { icon: Sparkles, accent: 'text-violet-300', bg: 'from-violet-500/20 via-fuchsia-400/10 to-violet-700/20', animation: 'animate-pulse' },
  discipline_lock: { icon: Shield, accent: 'text-emerald-300', bg: 'from-emerald-500/20 via-teal-400/10 to-emerald-700/20', animation: 'animate-pulse' },
  team_spirit: { icon: Users, accent: 'text-blue-300', bg: 'from-blue-500/20 via-indigo-400/10 to-blue-700/20', animation: 'animate-pulse' },
};

type ChildBadgeSummary = {
  student: {
    id: string;
    user: { fullName: string };
  };
  badges: StudentBadge[];
};

export function ParentBadgesView() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildBadgeSummary[]>([]);
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
          throw new Error('Failed to load child badges');
        }

        const json = await res.json();
        setChildren(Array.isArray(json.children) ? json.children : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const activeChild = useMemo(() => children[activeChildIndex] || null, [activeChildIndex, children]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Child Achievements</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review badges earned by your child from real academy progress and participation.</p>
        </div>

        {children.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
            {children.map((child, index) => (
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
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeChild?.badges?.map((badge) => (
          <div key={badge.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {(() => {
              const theme = BADGE_THEME[badge.categoryKey || 'team_spirit'] || BADGE_THEME.team_spirit;
              const Icon = theme.icon;

              return (
            <div className="flex items-center gap-3">
              <div className={`rounded-full bg-gradient-to-br ${theme.bg} p-3 ${theme.accent}`}>
                <Icon className={`h-5 w-5 ${badge.unlocked ? theme.animation : ''}`} />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{badge.title}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{badge.badgeCode} · Tier {badge.tier || 0}</div>
              </div>
            </div>
              );
            })()}
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{badge.description}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" style={{ width: `${Math.min(((badge.progressPoints || 0) / Math.max(badge.targetPoints || 1, 1)) * 100, 100)}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{badge.progressPoints || 0} / {badge.targetPoints || 0} pts</div>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">Awarded {new Date(badge.awardedAt).toLocaleDateString('id-ID')}</div>
          </div>
        ))}

        {!loading && !activeChild?.badges?.length && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 md:col-span-2 xl:col-span-3">
            <Trophy className="mx-auto mb-3 h-5 w-5" />
            No badges available for this child yet.
          </div>
        )}
      </div>
    </div>
  );
}
