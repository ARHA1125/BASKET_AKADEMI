'use client';

import { useAssessment, useStudents } from '@/hooks/use-academic';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PlayerAssessment } from '@/types/academic';
import { WeekMaterial, Level } from '@/types/curriculum';
import Cookies from 'js-cookie';
import { Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type CurriculumResponse = Level[];
type AgeClass = 'KU-10' | 'KU-12' | 'KU-14' | 'KU-17';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
const ageClassOptions: AgeClass[] = ['KU-10', 'KU-12', 'KU-14', 'KU-17'];

const formatDominantStat = (assessment: PlayerAssessment) => {
  return assessment.dominantStat || assessment.weekMaterial?.statDomain || '-';
};

export function CoachEvaluationsView() {
  const { allData: students, fetchData: fetchStudents } = useStudents();
  const { data: assessments, fetchAssessments, createAssessment, updateAssessment, deleteAssessment, loading } = useAssessment();
  const [curriculum, setCurriculum] = useState<CurriculumResponse>([]);
  const [selectedAgeClass, setSelectedAgeClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedWeekMaterialId, setSelectedWeekMaterialId] = useState('');
  const [score, setScore] = useState(3);
  const [coachNote, setCoachNote] = useState('');
  const [assessmentAgeClassFilter, setAssessmentAgeClassFilter] = useState('');
  const [assessmentSearch, setAssessmentSearch] = useState('');

  const [editTarget, setEditTarget] = useState<PlayerAssessment | null>(null);
  const [editScore, setEditScore] = useState(3);
  const [editCoachNote, setEditCoachNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PlayerAssessment | null>(null);

  useEffect(() => {
    fetchStudents(1, '', 200);
    fetchAssessments();
  }, [fetchAssessments, fetchStudents]);

  useEffect(() => {
    const run = async () => {
      try {
        const token = Cookies.get('auth_token');
        const res = await fetch(`${apiUrl}/academic/curriculum-levels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setCurriculum(await res.json());
        }
      } catch (error) {
        console.error(error);
      }
    };
    run();
  }, []);

  const weekMaterials = useMemo(() => {
    return curriculum.flatMap((level) =>
      level.months.flatMap((month) => month.weekMaterials.map((material) => ({
        ...material,
        label: `${level.name} · Bulan ${month.monthNumber} · Minggu ${material.weekNumber} · ${material.category}`,
      }))),
    );
  }, [curriculum]);

  const filteredStudents = useMemo(() => {
    if (!selectedAgeClass) return [];

    return students.filter(
      (student) => student.ageClass === selectedAgeClass || student.curriculumProfile === selectedAgeClass,
    );
  }, [selectedAgeClass, students]);

  const filteredWeekMaterials = useMemo(() => {
    if (!selectedAgeClass) return [];

    return weekMaterials.filter((material) => material.curriculumProfiles?.includes(selectedAgeClass));
  }, [selectedAgeClass, weekMaterials]);

  const filteredAssessments = useMemo(() => {
    const search = assessmentSearch.trim().toLowerCase();

    return assessments.filter((assessment) => {
      const assessmentAgeClass = assessment.student?.ageClass || assessment.student?.curriculumProfile || assessment.ageClass || assessment.curriculumProfile || '';
      const matchesClass = !assessmentAgeClassFilter || assessmentAgeClass === assessmentAgeClassFilter;
      const studentName = assessment.student?.user?.fullName?.toLowerCase() || '';
      const matchesSearch = !search || studentName.includes(search);

      return matchesClass && matchesSearch;
    });
  }, [assessmentAgeClassFilter, assessmentSearch, assessments]);

  useEffect(() => {
    setSelectedStudentId('');
    setSelectedWeekMaterialId('');
  }, [selectedAgeClass]);

  useEffect(() => {
    if (selectedStudentId && !filteredStudents.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId('');
    }
  }, [filteredStudents, selectedStudentId]);

  useEffect(() => {
    if (selectedWeekMaterialId && !filteredWeekMaterials.some((material) => material.id === selectedWeekMaterialId)) {
      setSelectedWeekMaterialId('');
    }
  }, [filteredWeekMaterials, selectedWeekMaterialId]);

  const weekMaterialMap = useMemo(() => {
    const map = new Map<string, string>();
    curriculum.forEach((level) => {
      level.months.forEach((month) => {
        month.weekMaterials.forEach((material) => {
          map.set(material.id, `${level.name} · Bln ${month.monthNumber} · Mgg ${material.weekNumber}`);
        });
      });
    });
    return map;
  }, [curriculum]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await createAssessment({
      studentId: selectedStudentId,
      weekMaterialId: selectedWeekMaterialId,
      score,
      coachNote,
      assessorName: 'Coach Dashboard',
    });

    if (success) {
      toast.success('Assessment saved');
      setCoachNote('');
      setScore(3);
    } else {
      toast.error('Failed to save assessment');
    }
  };

  const openEdit = (assessment: PlayerAssessment) => {
    setEditTarget(assessment);
    setEditScore(assessment.score);
    setEditCoachNote(assessment.coachNote || '');
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editTarget) return;
    const success = await updateAssessment(editTarget.id, {
      score: editScore,
      coachNote: editCoachNote,
    });
    if (success) {
      toast.success('Assessment updated');
      setEditTarget(null);
    } else {
      toast.error('Failed to update assessment');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteAssessment(deleteTarget.id);
    if (success) {
      toast.success('Assessment deleted');
      setDeleteTarget(null);
    } else {
      toast.error('Failed to delete assessment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Student Evaluations</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Assess students against curriculum competencies and derive FUT outputs automatically.
        </p>
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
              <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900" disabled={!selectedAgeClass} required>
                <option value="">{selectedAgeClass ? 'Select student' : 'Select class first'}</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student?.user?.fullName || 'Unknown'} · {student.ageClass || '-'} · {student.curriculumProfile || '-'}
                  </option>
                ))}
              </select>
              {selectedAgeClass && filteredStudents.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">No students found in {selectedAgeClass}.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Curriculum Material</label>
              <select value={selectedWeekMaterialId} onChange={(e) => setSelectedWeekMaterialId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900" disabled={!selectedAgeClass} required>
                <option value="">{selectedAgeClass ? 'Select competency' : 'Select class first'}</option>
                {filteredWeekMaterials.map((material) => (
                  <option key={material.id} value={material.id}>{material.label}</option>
                ))}
              </select>
              {selectedAgeClass && filteredWeekMaterials.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">No curriculum materials are mapped to {selectedAgeClass} yet.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Coach Score (1-5)</label>
              <input type="range" min={1} max={5} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Selected score: {score}</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Coach Note</label>
              <textarea value={coachNote} onChange={(e) => setCoachNote(e.target.value)} className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Add notes about execution, discipline, or consistency" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Assessment'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent FUT Assessments</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <select value={assessmentAgeClassFilter} onChange={(e) => setAssessmentAgeClassFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-44 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">All classes</option>
              {ageClassOptions.map((ageClass) => (
                <option key={ageClass} value={ageClass}>{ageClass}</option>
              ))}
            </select>
            <input
              type="search"
              value={assessmentSearch}
              onChange={(e) => setAssessmentSearch(e.target.value)}
              placeholder="Search student name"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:flex-1 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Curriculum</th>
                  <th className="px-3 py-2">Competency</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">OVR</th>
                  <th className="px-3 py-2">Dominant</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.slice(0, 12).map((assessment) => (
                  <tr key={assessment.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{assessment.student?.user?.fullName || 'Unknown'}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                      {assessment.weekMaterial?.id ? (weekMaterialMap.get(assessment.weekMaterial.id) || '-') : '-'}
                    </td>
                    <td className="px-3 py-2">{assessment.weekMaterial?.category || '-'}</td>
                    <td className="px-3 py-2">{assessment.score}/5</td>
                    <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{assessment.overallRating ?? '-'}</td>
                    <td className="px-3 py-2">{formatDominantStat(assessment)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(assessment)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                          title="Edit assessment"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(assessment)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                          title="Delete assessment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAssessments.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={7}>No assessments match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Edit Assessment</h3>
              <button onClick={() => setEditTarget(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="mb-3 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800">
              <div className="font-medium text-slate-900 dark:text-white">{editTarget.student?.user?.fullName || 'Unknown'}</div>
              <div className="text-slate-500 dark:text-slate-400">{editTarget.weekMaterial?.category || '-'} · OVR {editTarget.overallRating ?? '-'} · {formatDominantStat(editTarget)}</div>
            </div>

            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Coach Score (1-5)</label>
                <input type="range" min={1} max={5} value={editScore} onChange={(e) => setEditScore(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Selected score: {editScore}</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Coach Note</label>
                <textarea value={editCoachNote} onChange={(e) => setEditCoachNote(e.target.value)} className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Update coach notes..." />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Assessment"
        description={`Are you sure you want to delete the assessment for ${deleteTarget?.student?.user?.fullName || 'this student'}? This action cannot be undone.`}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
