'use client';

import { useAttendance } from '@/hooks/use-academic';
import { useEffect, useState } from 'react';

const AGE_CLASS_OPTIONS = ['', 'KU-10', 'KU-12', 'KU-14', 'KU-17'];

export function CoachAttendanceReportsView() {
  const { fetchAttendanceSummary, loading } = useAttendance();
  const [ageClass, setAgeClass] = useState('');
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const data = await fetchAttendanceSummary(ageClass || undefined);
      setSummary(Array.isArray(data) ? data : []);
    };
    run();
  }, [ageClass, fetchAttendanceSummary]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Attendance Reports</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review attendance rate by student and age class.</p>
        </div>
        <select value={ageClass} onChange={(e) => setAgeClass(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          {AGE_CLASS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option || 'All age classes'}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Age Class</th>
                <th className="px-3 py-2">Present</th>
                <th className="px-3 py-2">Late</th>
                <th className="px-3 py-2">Absent</th>
                <th className="px-3 py-2">Rate</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => (
                <tr key={row.studentId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{row.fullName}</td>
                  <td className="px-3 py-2">{row.ageClass || '-'}</td>
                  <td className="px-3 py-2">{row.presentCount}</td>
                  <td className="px-3 py-2">{row.lateCount}</td>
                  <td className="px-3 py-2">{row.absentCount}</td>
                  <td className="px-3 py-2 font-semibold text-blue-600 dark:text-blue-400">{row.attendanceRate}%</td>
                </tr>
              ))}
              {!loading && summary.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>No attendance summary available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
