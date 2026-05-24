'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParentDataStore } from '@/hooks/use-parent-data';
import { ParentStudentSwitcher } from './ParentStudentSwitcher';
import { Download, FileText, Star } from 'lucide-react';
import { getToken } from '@/lib/auth';

type AttendanceSummary = {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
};

export function ParentReportsView() {
  const { data: summary, loading: summaryLoading, activeChildIndex, fetchData } = useParentDataStore();
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceSummary>>({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = getToken();
      if (!token) return;
      try {
        setLoadingAttendance(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/me/children/attendance-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, AttendanceSummary> = {};
          data.forEach((item: AttendanceSummary) => {
            map[item.studentId] = item;
          });
          setAttendanceData(map);
        }
      } catch (e) {
        console.error('Failed to fetch attendance', e);
      } finally {
        setLoadingAttendance(false);
      }
    };
    fetchAttendance();
  }, []);

  const activeChild = useMemo(() => {
    if (!summary?.children?.length) return null;
    return summary.children[activeChildIndex] || summary.children[0];
  }, [activeChildIndex, summary?.children]);

  const handlePrint = () => {
    window.print();
  };

  const loading = summaryLoading || loadingAttendance;

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Memuat data laporan...
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Data anak aktif tidak ditemukan.
      </div>
    );
  }

  const { student, latestAssessment, assessments, gamification, leaderboard } = activeChild;
  const attendance = attendanceData[student.id];

  const statBar = (label: string, value: number, max = 100) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div className="flex items-center gap-3" key={label}>
        <div className="w-20 text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</div>
        <div className="h-2 flex-1 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
        <div className="w-8 text-right text-sm font-bold text-slate-700">{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
            background: white !important;
            color: black !important;
          }
          /* Ensure backgrounds print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide non-print elements inside the report if needed */
          .no-print {
            display: none !important;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      {/* Screen Header (Hidden on Print) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Laporan Akademik</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lihat dan unduh laporan kemajuan untuk anak-anak Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ParentStudentSwitcher />
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* The Printable Area */}
      <div
        id="printable-report"
        className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Report Header */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Wirabhakti Football Academy</h2>
            <h3 className="mt-1 text-lg font-semibold text-slate-600 dark:text-slate-300">Laporan Kemajuan Siswa</h3>
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Dibuat pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg">
             <FileText className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Section 1: Student Info */}
          <section className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/50">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Informasi Siswa</h4>
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 overflow-hidden rounded-lg border border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800">
                {student.user.photo_url ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${student.user.photo_url}`}
                    alt={student.user.fullName}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-200 text-3xl font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-600">
                    {student.user.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-y-2 gap-x-8 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Nama Lengkap</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{student.user.fullName}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Kelas Usia</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{student.ageClass || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Posisi</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{student.position || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Profil Kurikulum</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{student.curriculumProfile || '-'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Skill Performance */}
          <section className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Performa Keterampilan</h4>
            {latestAssessment ? (
              <div className="space-y-3">
                <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Peringkat Keseluruhan (OVR)</span>
                  <span className="text-xl font-black text-blue-700 dark:text-blue-400">{latestAssessment.overallRating}</span>
                </div>
                {statBar('Kecepatan', latestAssessment.speedScore)}
                {statBar('Tendangan', latestAssessment.shootingScore)}
                {statBar('Operan', latestAssessment.passingScore)}
                {statBar('Giringan', latestAssessment.dribblingScore)}
                {statBar('Pertahanan', latestAssessment.defenseScore)}
                {statBar('Fisik', latestAssessment.physicalScore)}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data evaluasi untuk siswa ini.</p>
            )}
          </section>

          {/* Section 3: Attendance Summary */}
          <section className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ringkasan Kehadiran</h4>
            {attendance ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Sesi Latihan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{attendance.totalSessions}</span>
                </div>
                <div className="space-y-3">
                  {statBar('Hadir', attendance.presentCount, attendance.totalSessions)}
                  {statBar('Terlambat', attendance.lateCount, attendance.totalSessions)}
                  {statBar('Tidak Hadir', attendance.absentCount, attendance.totalSessions)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tingkat Kehadiran</span>
                  <span className={`text-lg font-black ${attendance.attendanceRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {Math.round(attendance.attendanceRate)}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data kehadiran.</p>
            )}
          </section>

          {/* Section 4: Gamification & Achievements */}
          <section className="col-span-full rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Pencapaian & Papan Peringkat</h4>
            <div className="mb-6 flex flex-wrap gap-4">
               <div className="min-w-[150px] flex-1 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                 <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-500">Total Poin</div>
                 <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{gamification?.totalPoints || 0}</div>
               </div>
               <div className="min-w-[150px] flex-1 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                 <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-500">Peringkat Kelompok</div>
                 <div className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">{leaderboard?.currentRank ? `#${leaderboard.currentRank}` : 'Tanpa Peringkat'}</div>
                 <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">dari {leaderboard?.totalPlayers || 0} pemain</div>
               </div>
            </div>
            
            {gamification?.categories && gamification.categories.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gamification.categories.map((item: any) => (
                  <div key={item.badge.badgeCode} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{item.badge.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.badge.progressPoints} / {item.badge.targetPoints} pts</div>
                    </div>
                    <div className="font-bold text-blue-700 dark:text-blue-400">Tingkat {item.badge.tier || 0}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Assessment History */}
          <section className="col-span-full rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Evaluasi Terbaru</h4>
            {assessments && assessments.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Kompetensi</th>
                      <th className="px-4 py-3 font-medium">Skor</th>
                      <th className="px-4 py-3 font-medium">Peringkat</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Catatan Pelatih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {assessments.slice(0, 5).map((assessment: any) => (
                      <tr key={assessment.id} className="bg-white dark:bg-slate-950/20">
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {new Date(assessment.assessedAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {assessment.weekMaterial?.category || 'Umum'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {assessment.score}/5
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= (assessment.score || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                                }
                              />
                            ))}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-500 italic sm:table-cell dark:text-slate-400">
                          {assessment.coachNote ? `"${assessment.coachNote}"` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada evaluasi masa lalu yang ditemukan.</p>
            )}
          </section>

          {/* Footer Signature */}
          <div className="col-span-full mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <p>Dokumen ini dibuat oleh komputer dan tidak memerlukan tanda tangan fisik.</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} Wirabhakti Football Academy. Hak cipta dilindungi undang-undang.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
