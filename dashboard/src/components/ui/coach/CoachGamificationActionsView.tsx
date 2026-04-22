'use client';

import { useStudentActivities, useStudents } from '@/hooks/use-academic';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type AgeClass = 'KU-10' | 'KU-12' | 'KU-14' | 'KU-17';

const ACTIVITY_PRESETS = [
  { label: 'Lineup Selected', activityType: 'LINEUP_SELECTION', points: 20, ruleCode: 'LINEUP_SELECTED', reason: 'Selected into lineup +20' },
  { label: 'Event Participation', activityType: 'EVENT_PARTICIPATION', points: 15, ruleCode: 'EVENT_PARTICIPATION', reason: 'Participated in event +15' },
  { label: 'Discipline Bonus', activityType: 'DISCIPLINE', points: 5, ruleCode: 'DISCIPLINE_BONUS', reason: 'Discipline bonus +5' },
  { label: 'Teamwork Bonus', activityType: 'TEAMWORK', points: 5, ruleCode: 'TEAMWORK_BONUS', reason: 'Teamwork bonus +5' },
  { label: 'Coach Feedback Bonus', activityType: 'COACH_FEEDBACK', points: 5, ruleCode: 'COACH_FEEDBACK_BONUS', reason: 'Coach feedback bonus +5' },
  { label: 'Skill Progress Milestone', activityType: 'SKILL_PROGRESS', points: 10, ruleCode: 'SKILL_PROGRESS', reason: 'Skill progress milestone +10' },
] as const;

const ageClassOptions: AgeClass[] = ['KU-10', 'KU-12', 'KU-14', 'KU-17'];

export function CoachGamificationActionsView() {
  const { allData: students, fetchData: fetchStudents } = useStudents();
  const { data: activities, fetchActivities, createActivity, updateActivity, deleteActivity, awardPoints, loading } = useStudentActivities();
  const [selectedAgeClass, setSelectedAgeClass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [presetIndex, setPresetIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [activityAgeClassFilter, setActivityAgeClassFilter] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [editTargetId, setEditTargetId] = useState('');
  const [editActivityType, setEditActivityType] = useState<(typeof ACTIVITY_PRESETS)[number]['activityType']>(ACTIVITY_PRESETS[0].activityType);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState('');

  useEffect(() => {
    fetchStudents(1, '', 200);
    fetchActivities();
  }, [fetchActivities, fetchStudents]);

  const preset = ACTIVITY_PRESETS[presetIndex];

  const filteredStudents = useMemo(() => {
    if (!selectedAgeClass) return [];

    return students.filter(
      (student) => student.ageClass === selectedAgeClass || student.curriculumProfile === selectedAgeClass,
    );
  }, [selectedAgeClass, students]);

  const filteredActivities = useMemo(() => {
    const search = activitySearch.trim().toLowerCase();

    return activities.filter((activity) => {
      const activityAgeClass = activity.student?.ageClass || activity.student?.curriculumProfile || '';
      const matchesClass = !activityAgeClassFilter || activityAgeClass === activityAgeClassFilter;
      const studentName = activity.student?.user?.fullName?.toLowerCase() || '';
      const matchesSearch = !search || studentName.includes(search);

      return matchesClass && matchesSearch;
    });
  }, [activities, activityAgeClassFilter, activitySearch]);

  useEffect(() => {
    setStudentId('');
  }, [selectedAgeClass]);

  useEffect(() => {
    if (studentId && !filteredStudents.some((student) => student.id === studentId)) {
      setStudentId('');
    }
  }, [filteredStudents, studentId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const activity = await createActivity({
      studentId,
      activityType: preset.activityType,
      title: preset.label,
      description,
      createdBy: 'coach-dashboard',
    });

    if (!activity?.id) {
      toast.error('Failed to create activity');
      return;
    }

    const awarded = await awardPoints({
      studentId,
      activityId: activity.id,
      points: preset.points,
      ruleCode: preset.ruleCode,
      reason: preset.reason,
      awardedBy: 'coach-dashboard',
    });

    if (!awarded) {
      toast.error('Activity saved but failed to award points');
      return;
    }

    toast.success('Gamification activity and points recorded');
    setDescription('');
    fetchActivities();
  };

  const startEdit = (activity: (typeof activities)[number]) => {
    setEditTargetId(activity.id);
    setEditActivityType(
      ACTIVITY_PRESETS.find((option) => option.activityType === activity.activityType)?.activityType || ACTIVITY_PRESETS[0].activityType,
    );
    setEditTitle(activity.title || '');
    setEditDescription(activity.description || '');
  };

  const cancelEdit = () => {
    setEditTargetId('');
    setEditActivityType(ACTIVITY_PRESETS[0].activityType);
    setEditTitle('');
    setEditDescription('');
  };

  const handleUpdate = async (activityId: string) => {
    const selectedPreset = ACTIVITY_PRESETS.find((option) => option.activityType === editActivityType);
    const ok = await updateActivity(activityId, {
      activityType: editActivityType,
      title: editTitle || selectedPreset?.label,
      description: editDescription,
    });

    if (!ok) {
      toast.error('Failed to update activity');
      return;
    }

    toast.success('Activity updated');
    cancelEdit();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    const ok = await deleteActivity(deleteTargetId);
    if (!ok) {
      toast.error('Failed to delete activity');
      return;
    }

    toast.success('Activity and linked points deleted');
    if (editTargetId === deleteTargetId) {
      cancelEdit();
    }
    setDeleteTargetId('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Coach Gamification Actions</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Award lineup, event, discipline, teamwork, feedback, and skill progress points.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Class / KU</label>
              <select value={selectedAgeClass} onChange={(e) => setSelectedAgeClass(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required>
                <option value="">Select class</option>
                {ageClassOptions.map((ageClass) => (
                  <option key={ageClass} value={ageClass}>{ageClass}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Student</label>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900" disabled={!selectedAgeClass} required>
                <option value="">{selectedAgeClass ? 'Select student' : 'Select class first'}</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>{student.user?.fullName || 'Unknown Student'} · {student.ageClass || '-'}</option>
                ))}
              </select>
              {selectedAgeClass && filteredStudents.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">No students found in {selectedAgeClass}.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Activity Type</label>
              <select value={presetIndex} onChange={(e) => setPresetIndex(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {ACTIVITY_PRESETS.map((option, index) => (
                  <option key={option.ruleCode} value={index}>{option.label} ({option.points} pts)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Optional context for the awarded activity" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : `Award ${preset.points} Points`}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activities</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <select value={activityAgeClassFilter} onChange={(e) => setActivityAgeClassFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-44 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">All classes</option>
              {ageClassOptions.map((ageClass) => (
                <option key={ageClass} value={ageClass}>{ageClass}</option>
              ))}
            </select>
            <input
              type="search"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Search student name"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:flex-1 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.slice(0, 12).map((activity) => (
                  <tr key={activity.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{activity.student?.user?.fullName || 'Unknown Student'}</td>
                    <td className="px-3 py-2">
                      {editTargetId === activity.id ? (
                        <div className="space-y-2">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="min-h-20 w-full rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <div>{activity.title}</div>
                          {activity.description && (
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activity.description}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editTargetId === activity.id ? (
                        <select
                          value={editActivityType}
                          onChange={(e) => {
                            const nextType = e.target.value as (typeof ACTIVITY_PRESETS)[number]['activityType'];
                            const nextPreset = ACTIVITY_PRESETS.find((option) => option.activityType === nextType);
                            setEditActivityType(nextType);
                            if (nextPreset && editTitle === (activity.title || '')) {
                              setEditTitle(nextPreset.label);
                            }
                          }}
                          className="w-full rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {ACTIVITY_PRESETS.map((option) => (
                            <option key={option.ruleCode} value={option.activityType}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        activity.activityType
                      )}
                    </td>
                    <td className="px-3 py-2">{new Date(activity.createdAt).toLocaleString('id-ID')}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {editTargetId === activity.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdate(activity.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                              aria-label="Save activity"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              aria-label="Cancel edit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(activity)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                              aria-label="Edit activity"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(activity.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                              aria-label="Delete activity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={5}>No activities match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Activity"
        description="Are you sure you want to delete this activity and its linked gamification points? This action cannot be undone."
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId('');
        }}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
