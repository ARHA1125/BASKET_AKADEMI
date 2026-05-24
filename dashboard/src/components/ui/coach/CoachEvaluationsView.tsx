'use client';

import { useAssessment, useStudents } from '@/hooks/use-academic';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PlayerAssessment } from '@/types/academic';
import { WeekMaterial, Level } from '@/types/curriculum';
import Cookies from 'js-cookie';
import { Pencil, Star, Trash2, X } from 'lucide-react';
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
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false);
  const [selectedMonthNumber, setSelectedMonthNumber] = useState<number | null>(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [score, setScore] = useState(3);
  const [coachNote, setCoachNote] = useState('');
  const [assessmentAgeClassFilter, setAssessmentAgeClassFilter] = useState('');
  const [assessmentMonthFilter, setAssessmentMonthFilter] = useState('');
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

  const groupedWeekMaterials = useMemo(() => {
    if (!selectedAgeClass) return [];

    return curriculum
      .map((level) => ({
        levelName: level.name,
        months: level.months
          .map((month) => ({
            monthNumber: month.monthNumber,
            title: month.title,
            weekGroups: [1, 2, 3, 4]
              .map((weekNumber) => ({
                weekNumber,
                materials: month.weekMaterials.filter(
                  (material) =>
                    material.weekNumber === weekNumber && material.curriculumProfiles?.includes(selectedAgeClass),
                ),
              }))
              .filter((weekGroup) => weekGroup.materials.length > 0),
          }))
          .filter((month) => month.weekGroups.length > 0),
      }))
      .filter((level) => level.months.length > 0);
  }, [curriculum, selectedAgeClass]);

  const availableMonths = useMemo(() => {
    return groupedWeekMaterials.flatMap((level) =>
      level.months.map((month) => ({
        levelName: level.levelName,
        monthNumber: month.monthNumber,
        title: month.title,
      })),
    );
  }, [groupedWeekMaterials]);

  const selectedMonthData = useMemo(() => {
    if (selectedMonthNumber === null) return null;

    for (const level of groupedWeekMaterials) {
      const month = level.months.find((item) => item.monthNumber === selectedMonthNumber);
      if (month) {
        return {
          levelName: level.levelName,
          ...month,
        };
      }
    }

    return null;
  }, [groupedWeekMaterials, selectedMonthNumber]);

  const selectedWeekGroup = useMemo(() => {
    if (!selectedMonthData || selectedWeekNumber === null) return null;

    return selectedMonthData.weekGroups.find((weekGroup) => weekGroup.weekNumber === selectedWeekNumber) || null;
  }, [selectedMonthData, selectedWeekNumber]);

  const selectedWeekMaterial = useMemo(() => {
    return filteredWeekMaterials.find((material) => material.id === selectedWeekMaterialId) || null;
  }, [filteredWeekMaterials, selectedWeekMaterialId]);

  const selectedWeekMaterialSummary = useMemo(() => {
    if (!selectedWeekMaterial) return '';

    for (const level of groupedWeekMaterials) {
      for (const month of level.months) {
        for (const weekGroup of month.weekGroups) {
          const material = weekGroup.materials.find((item) => item.id === selectedWeekMaterial.id);
          if (material) {
            return `${level.levelName} · Bulan ${month.monthNumber} · Minggu ${weekGroup.weekNumber} · ${material.category}`;
          }
        }
      }
    }

    return selectedWeekMaterial.label;
  }, [groupedWeekMaterials, selectedWeekMaterial]);

  const assessmentMonthOptions = useMemo(() => {
    const monthMap = new Map<string, { value: string; label: string }>();

    curriculum.forEach((level) => {
      level.months.forEach((month) => {
        const value = String(month.monthNumber);
        if (!monthMap.has(value)) {
          monthMap.set(value, {
            value,
            label: `Bulan ${month.monthNumber}`,
          });
        }
      });
    });

    return Array.from(monthMap.values()).sort((a, b) => Number(a.value) - Number(b.value));
  }, [curriculum]);

  useEffect(() => {
    setSelectedStudentId('');
    setSelectedWeekMaterialId('');
    setSelectedMonthNumber(null);
    setSelectedWeekNumber(null);
    setIsMaterialPickerOpen(false);
  }, [selectedAgeClass]);

  useEffect(() => {
    if (selectedStudentId && !filteredStudents.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId('');
    }
  }, [filteredStudents, selectedStudentId]);

  useEffect(() => {
    if (selectedWeekMaterialId && !filteredWeekMaterials.some((material) => material.id === selectedWeekMaterialId)) {
      setSelectedWeekMaterialId('');
      setSelectedMonthNumber(null);
      setSelectedWeekNumber(null);
    }
  }, [filteredWeekMaterials, selectedWeekMaterialId]);

  useEffect(() => {
    if (selectedMonthNumber !== null && !availableMonths.some((month) => month.monthNumber === selectedMonthNumber)) {
      setSelectedMonthNumber(null);
      setSelectedWeekNumber(null);
    }
  }, [availableMonths, selectedMonthNumber]);

  useEffect(() => {
    if (
      selectedWeekNumber !== null
      && !selectedMonthData?.weekGroups.some((weekGroup) => weekGroup.weekNumber === selectedWeekNumber)
    ) {
      setSelectedWeekNumber(null);
    }
  }, [selectedMonthData, selectedWeekNumber]);

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

  const filteredAssessments = useMemo(() => {
    const search = assessmentSearch.trim().toLowerCase();

    return assessments.filter((assessment) => {
      const assessmentAgeClass = assessment.student?.ageClass || assessment.student?.curriculumProfile || assessment.ageClass || assessment.curriculumProfile || '';
      const matchesClass = !assessmentAgeClassFilter || assessmentAgeClass === assessmentAgeClassFilter;
      const curriculumLabel = assessment.weekMaterial?.id ? (weekMaterialMap.get(assessment.weekMaterial.id) || '') : '';
      const matchesMonth = !assessmentMonthFilter || curriculumLabel.includes(`Bln ${assessmentMonthFilter}`);
      const studentName = assessment.student?.user?.fullName?.toLowerCase() || '';
      const matchesSearch = !search || studentName.includes(search);

      return matchesClass && matchesMonth && matchesSearch;
    });
  }, [assessmentAgeClassFilter, assessmentMonthFilter, assessmentSearch, assessments, weekMaterialMap]);

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
      toast.success('Evaluasi berhasil disimpan');
      setCoachNote('');
      setScore(3);
    } else {
      toast.error('Gagal menyimpan evaluasi');
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
      toast.success('Evaluasi berhasil diperbarui');
      setEditTarget(null);
    } else {
      toast.error('Gagal memperbarui evaluasi');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteAssessment(deleteTarget.id);
    if (success) {
      toast.success('Evaluasi berhasil dihapus');
      setDeleteTarget(null);
    } else {
      toast.error('Gagal menghapus evaluasi');
    }
  };

  const resetMaterialPicker = () => {
    setSelectedMonthNumber(null);
    setSelectedWeekNumber(null);
    setSelectedWeekMaterialId('');
  };

  const handleSelectMonth = (monthNumber: number) => {
    setSelectedMonthNumber(monthNumber);
    setSelectedWeekNumber(null);
  };

  const handleSelectMaterial = (materialId: string) => {
    setSelectedWeekMaterialId(materialId);
    setIsMaterialPickerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Evaluasi Siswa</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Evaluasi siswa berdasarkan kompetensi kurikulum dan hasilkan output FUT secara otomatis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Kelas / KU</label>
              <select value={selectedAgeClass} onChange={(e) => setSelectedAgeClass(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required>
                <option value="">Pilih kelas</option>
                {ageClassOptions.map((ageClass) => (
                  <option key={ageClass} value={ageClass}>{ageClass}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Siswa</label>
              <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900" disabled={!selectedAgeClass} required>
                <option value="">{selectedAgeClass ? 'Pilih siswa' : 'Pilih kelas terlebih dahulu'}</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student?.user?.fullName || 'Tidak Diketahui'} · {student.ageClass || '-'} · {student.curriculumProfile || '-'}
                  </option>
                ))}
              </select>
              {selectedAgeClass && filteredStudents.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Tidak ada siswa yang ditemukan di {selectedAgeClass}.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Materi Kurikulum</label>
              <button
                type="button"
                onClick={() => setIsMaterialPickerOpen(true)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900"
                disabled={!selectedAgeClass || filteredWeekMaterials.length === 0}
              >
                {selectedWeekMaterialSummary || (selectedAgeClass ? 'Pilih bulan dan minggu' : 'Pilih kelas terlebih dahulu')}
              </button>
              {selectedWeekMaterialSummary && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <span>{selectedWeekMaterialSummary}</span>
                  <button
                    type="button"
                    onClick={resetMaterialPicker}
                    className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Reset
                  </button>
                </div>
              )}
              <input type="hidden" value={selectedWeekMaterialId} required />
              {selectedAgeClass && filteredWeekMaterials.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Belum ada materi kurikulum yang dipetakan ke {selectedAgeClass}.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nilai Pelatih (1-5)</label>
              <input type="range" min={1} max={5} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Nilai terpilih: {score}</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan Pelatih</label>
              <textarea value={coachNote} onChange={(e) => setCoachNote(e.target.value)} className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Tambahkan catatan tentang pelaksanaan, disiplin, atau konsistensi" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Evaluasi'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Evaluasi FUT Terbaru</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <select value={assessmentAgeClassFilter} onChange={(e) => setAssessmentAgeClassFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-44 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">Semua kelas</option>
              {ageClassOptions.map((ageClass) => (
                <option key={ageClass} value={ageClass}>{ageClass}</option>
              ))}
            </select>
            <select value={assessmentMonthFilter} onChange={(e) => setAssessmentMonthFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">Semua bulan</option>
              {assessmentMonthOptions.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <input
              type="search"
              value={assessmentSearch}
              onChange={(e) => setAssessmentSearch(e.target.value)}
              placeholder="Cari nama siswa"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:flex-1 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Siswa</th>
                  <th className="px-3 py-2">Kurikulum</th>
                  <th className="px-3 py-2">Kompetensi</th>
                  <th className="px-3 py-2">Nilai</th>
                  <th className="px-3 py-2">Bintang</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.slice(0, 12).map((assessment) => (
                  <tr key={assessment.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{assessment.student?.user?.fullName || 'Tidak Diketahui'}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                      {assessment.weekMaterial?.id ? (weekMaterialMap.get(assessment.weekMaterial.id) || '-') : '-'}
                    </td>
                    <td className="px-3 py-2">{assessment.weekMaterial?.category || '-'}</td>
                    <td className="px-3 py-2">{assessment.score}/5</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= (assessment.score || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                            }
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(assessment)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                          title="Edit evaluasi"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(assessment)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                          title="Hapus evaluasi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAssessments.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Tidak ada evaluasi yang cocok dengan filter saat ini.</td>
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
              <h3 className="font-semibold text-slate-900 dark:text-white">Edit Evaluasi</h3>
              <button onClick={() => setEditTarget(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="mb-3 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800">
              <div className="font-medium text-slate-900 dark:text-white">{editTarget.student?.user?.fullName || 'Tidak Diketahui'}</div>
              <div className="text-slate-500 dark:text-slate-400">{editTarget.weekMaterial?.category || '-'} · OVR {editTarget.overallRating ?? '-'} · {formatDominantStat(editTarget)}</div>
            </div>

            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nilai Pelatih (1-5)</label>
                <input type="range" min={1} max={5} value={editScore} onChange={(e) => setEditScore(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Nilai terpilih: {editScore}</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan Pelatih</label>
                <textarea value={editCoachNote} onChange={(e) => setEditCoachNote(e.target.value)} className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Perbarui catatan pelatih..." />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMaterialPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Pilih Materi Kurikulum</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pilih bulan, lalu minggu, kemudian pilih materi untuk {selectedAgeClass}.
                </p>
              </div>
              <button onClick={() => setIsMaterialPickerOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-3">
              <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 text-sm font-medium text-slate-900 dark:text-white">1. Pilih Bulan</div>
                <div className="grid max-h-[50vh] grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
                  {availableMonths.map((month) => (
                    <button
                      key={`${month.levelName}-${month.monthNumber}`}
                      type="button"
                      onClick={() => handleSelectMonth(month.monthNumber)}
                      className={`rounded-lg border px-3 py-3 text-left text-sm ${selectedMonthNumber === month.monthNumber
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                    >
                      <div className="font-medium">Bulan {month.monthNumber}</div>
                      <div className="text-xs opacity-80">{month.levelName}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 text-sm font-medium text-slate-900 dark:text-white">2. Pilih Minggu</div>
                {!selectedMonthData ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pilih bulan terlebih dahulu.</p>
                ) : (
                  <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                    {selectedMonthData.weekGroups.map((weekGroup) => (
                      <button
                        key={weekGroup.weekNumber}
                        type="button"
                        onClick={() => setSelectedWeekNumber(weekGroup.weekNumber)}
                        className={`w-full rounded-lg border px-3 py-3 text-left text-sm ${selectedWeekNumber === weekGroup.weekNumber
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                      >
                        <div className="font-medium">Minggu {weekGroup.weekNumber}</div>
                        <div className="text-xs opacity-80">{weekGroup.materials.length} materi</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 text-sm font-medium text-slate-900 dark:text-white">3. Pilih Materi</div>
                {!selectedWeekGroup ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pilih minggu terlebih dahulu.</p>
                ) : (
                  <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                    {selectedWeekGroup.materials.map((material) => (
                      <button
                        key={material.id}
                        type="button"
                        onClick={() => handleSelectMaterial(material.id)}
                        className={`w-full rounded-lg border px-3 py-3 text-left text-sm ${selectedWeekMaterialId === material.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                      >
                        <div className="font-medium">{material.category}</div>
                        <div className="mt-1 line-clamp-3 text-xs opacity-80">{material.materialDescription}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800">
              <div className="text-slate-600 dark:text-slate-300">
                {selectedWeekMaterialSummary || 'Belum ada materi yang dipilih.'}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetMaterialPicker}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaterialPickerOpen(false)}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Evaluasi"
        description={`Apakah Anda yakin ingin menghapus evaluasi untuk ${deleteTarget?.student?.user?.fullName || 'siswa ini'}? Tindakan ini tidak dapat dibatalkan.`}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        loading={loading}
        confirmLabel="Hapus"
        cancelLabel="Batal"
      />
    </div>
  );
}
