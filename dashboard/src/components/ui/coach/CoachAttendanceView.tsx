'use client';

import { useAttendance, useStudents } from '@/hooks/use-academic';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const ATTENDANCE_STATUSES = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const;
type AgeClass = 'KU-10' | 'KU-12' | 'KU-14' | 'KU-17';
const ageClassOptions: AgeClass[] = ['KU-10', 'KU-12', 'KU-14', 'KU-17'];

export function CoachAttendanceView() {
  const { allData: students, fetchData: fetchStudents } = useStudents();
  const { data: attendance, fetchAttendance, createAttendance, loading } = useAttendance();
  const [selectedAgeClass, setSelectedAgeClass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<(typeof ATTENDANCE_STATUSES)[number]>('PRESENT');
  const [attendanceAgeClassFilter, setAttendanceAgeClassFilter] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');

  useEffect(() => {
    fetchStudents(1, '', 200);
    fetchAttendance();
  }, [fetchAttendance, fetchStudents]);

  const filteredStudents = useMemo(() => {
    if (!selectedAgeClass) return [];

    return students.filter(
      (student) => student.ageClass === selectedAgeClass || student.curriculumProfile === selectedAgeClass,
    );
  }, [selectedAgeClass, students]);

  const filteredAttendance = useMemo(() => {
    const search = attendanceSearch.trim().toLowerCase();

    return attendance.filter((entry) => {
      const entryAgeClass = entry.student?.ageClass || entry.student?.curriculumProfile || '';
      const matchesClass = !attendanceAgeClassFilter || entryAgeClass === attendanceAgeClassFilter;
      const studentName = entry.student?.user?.fullName?.toLowerCase() || '';
      const matchesSearch = !search || studentName.includes(search);

      return matchesClass && matchesSearch;
    });
  }, [attendance, attendanceAgeClassFilter, attendanceSearch]);

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
    const success = await createAttendance({
      studentId,
      status,
      date: new Date().toISOString(),
      checkInTime: new Date().toISOString(),
    });

    if (success) {
      toast.success('Attendance recorded and gamification updated');
    } else {
      toast.error('Failed to record attendance');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Manage Attendance</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recording attendance here also feeds weekly points and activity history automatically.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
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
                  <option key={student.id} value={student.id}>{student.user.fullName} · {student.ageClass || '-'}</option>
                ))}
              </select>
              {selectedAgeClass && filteredStudents.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">No students found in {selectedAgeClass}.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as (typeof ATTENDANCE_STATUSES)[number])} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {ATTENDANCE_STATUSES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Record Attendance'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Attendance</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <select value={attendanceAgeClassFilter} onChange={(e) => setAttendanceAgeClassFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-44 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">All classes</option>
              {ageClassOptions.map((ageClass) => (
                <option key={ageClass} value={ageClass}>{ageClass}</option>
              ))}
            </select>
            <input
              type="search"
              value={attendanceSearch}
              onChange={(e) => setAttendanceSearch(e.target.value)}
              placeholder="Search student name"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:flex-1 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.slice(0, 12).map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{entry.student?.user?.fullName || 'Unknown Student'}</td>
                    <td className="px-3 py-2">{entry.status}</td>
                    <td className="px-3 py-2">{new Date(entry.date).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {filteredAttendance.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={3}>No attendance matches the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
