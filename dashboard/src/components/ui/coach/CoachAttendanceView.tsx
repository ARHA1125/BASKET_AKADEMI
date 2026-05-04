'use client';

import { useAttendance, useStudents } from '@/hooks/use-academic';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

const ATTENDANCE_STATUSES = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const;
type AgeClass = 'KU-10' | 'KU-12' | 'KU-14' | 'KU-17';
const ageClassOptions: AgeClass[] = ['KU-10', 'KU-12', 'KU-14', 'KU-17'];

// Helper for date calculations if needed
function getMonthKey(dateStr: string | Date) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function CoachAttendanceView() {
  const { allData: students, fetchData: fetchStudents } = useStudents();
  const { data: attendance, fetchAttendance, createAttendance, loading } = useAttendance();
  const [selectedAgeClass, setSelectedAgeClass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<(typeof ATTENDANCE_STATUSES)[number]>('PRESENT');
  const [attendanceAgeClassFilter, setAttendanceAgeClassFilter] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
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

  const groupedAttendance = useMemo(() => {
    if (!attendanceAgeClassFilter) return null;

    const classStudents = students.filter(
      (student) => student.ageClass === attendanceAgeClassFilter || student.curriculumProfile === attendanceAgeClassFilter
    );

    const search = attendanceSearch.trim().toLowerCase();

    type WeekData = { records: any[], stats: { present: number, late: number, absent: number, excused: number }, totalStudents: number };
    const monthGroups: Record<string, Record<string, WeekData>> = {};

    attendance.forEach((entry) => {
      const entryAgeClass = entry.student?.ageClass || entry.student?.curriculumProfile || '';
      if (entryAgeClass !== attendanceAgeClassFilter) return;

      const studentName = entry.student?.user?.fullName?.toLowerCase() || '';
      if (search && !studentName.includes(search)) return;

      const d = new Date(entry.date);
      const monthKey = getMonthKey(d);
      
      const dateOfMonth = d.getDate();
      const weekNumber = Math.ceil(dateOfMonth / 7);
      const weekKey = `Week ${weekNumber}`;

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {};
      }
      
      if (!monthGroups[monthKey][weekKey]) {
        monthGroups[monthKey][weekKey] = {
          records: [],
          stats: { present: 0, late: 0, absent: 0, excused: 0 },
          totalStudents: classStudents.length
        };
      }

      monthGroups[monthKey][weekKey].records.push(entry);
      const status = entry.status.toUpperCase();
      if (status === 'PRESENT') monthGroups[monthKey][weekKey].stats.present++;
      else if (status === 'LATE') monthGroups[monthKey][weekKey].stats.late++;
      else if (status === 'ABSENT') monthGroups[monthKey][weekKey].stats.absent++;
      else if (status === 'EXCUSED') monthGroups[monthKey][weekKey].stats.excused++;
    });

    return Object.entries(monthGroups)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort months descending
      .map(([monthKey, weeks]) => {
        const date = new Date(`${monthKey}-01`);
        const monthLabel = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        const sortedWeeks = Object.entries(weeks)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort Week 1, Week 2 ascending
          .map(([weekKey, data]) => ({
            weekKey,
            ...data
          }));
          
        return {
          monthKey,
          monthLabel,
          weeks: sortedWeeks
        };
      });
  }, [attendance, attendanceAgeClassFilter, attendanceSearch, students]);

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
      // Refetch the attendance to ensure it is immediately updated
      fetchAttendance();
    } else {
      toast.error('Failed to record attendance');
    }
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const toggleWeek = (monthKey: string, weekKey: string) => {
    const key = `${monthKey}-${weekKey}`;
    setExpandedWeeks(prev => ({ ...prev, [key]: !prev[key] }));
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
                  <option key={student.id} value={student.id}>{student.user?.fullName} · {student.ageClass || '-'}</option>
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
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Attendance</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <select value={attendanceAgeClassFilter} onChange={(e) => setAttendanceAgeClassFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-44 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">Select class...</option>
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
              disabled={!attendanceAgeClassFilter}
            />
          </div>

          <div className="mt-6 space-y-4">
            {!groupedAttendance ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Please select a class category to view weekly attendance.</p>
              </div>
            ) : groupedAttendance.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">No attendance records found for this class.</p>
              </div>
            ) : (
              groupedAttendance.map((monthGroup) => (
                <div key={monthGroup.monthKey} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => toggleMonth(monthGroup.monthKey)}
                    className="flex w-full items-center justify-between bg-slate-50 px-4 py-4 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/80"
                  >
                    <div className="text-left">
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{monthGroup.monthLabel}</p>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${expandedMonths[monthGroup.monthKey] ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedMonths[monthGroup.monthKey] && (
                    <div className="border-t border-slate-200 bg-white p-4 space-y-4 dark:border-slate-700 dark:bg-slate-900/50">
                      {monthGroup.weeks.map((weekGroup) => {
                        const weekStateKey = `${monthGroup.monthKey}-${weekGroup.weekKey}`;
                        return (
                          <div key={weekGroup.weekKey} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <button 
                              onClick={() => toggleWeek(monthGroup.monthKey, weekGroup.weekKey)}
                              className="flex w-full items-center justify-between bg-slate-50/50 px-4 py-3 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800/80"
                            >
                              <div className="text-left">
                                <p className="font-medium text-slate-900 dark:text-white">{weekGroup.weekKey}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  Total Students: {weekGroup.totalStudents} | Present: {weekGroup.stats.present} | Absent: {weekGroup.stats.absent} | Excused: {weekGroup.stats.excused} | Late: {weekGroup.stats.late}
                                </p>
                              </div>
                              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedWeeks[weekStateKey] ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedWeeks[weekStateKey] && (
                              <div className="border-t border-slate-200 p-0 dark:border-slate-700">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-50/80 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                                    <tr>
                                      <th className="px-4 py-2 font-medium">Student</th>
                                      <th className="px-4 py-2 font-medium">Status</th>
                                      <th className="px-4 py-2 font-medium">Date Recorded</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {weekGroup.records.map((entry) => (
                                      <tr key={entry.id} className="border-t border-slate-100 dark:border-slate-800/50">
                                        <td className="px-4 py-2">{entry.student?.user?.fullName || 'Unknown Student'}</td>
                                        <td className="px-4 py-2">
                                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            entry.status === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                                            entry.status === 'LATE' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                                            entry.status === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400'
                                          }`}>
                                            {entry.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleString('id-ID')}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

