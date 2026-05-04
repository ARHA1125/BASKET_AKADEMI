'use client';

import { useStudents } from '@/hooks/use-academic';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export function CoachStudentsView() {
  const { 
    allData: students, 
    fetchData: fetchStudents, 
    updateResource, 
    loading 
  } = useStudents();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents(1, '', 200);
  }, [fetchStudents]);

  const handleAgeClassChange = async (studentId: string, newAgeClass: string) => {
    setUpdatingId(studentId);
    
    // Auto-map ageClass to curriculumProfile
    let curriculumProfile = undefined;
    if (newAgeClass === 'KU-10') curriculumProfile = 'KU-10';
    else if (newAgeClass === 'KU-12') curriculumProfile = 'KU-12';
    else if (newAgeClass === 'KU-14') curriculumProfile = 'KU-14';
    else if (newAgeClass === 'KU-17') curriculumProfile = 'KU-17';

    try {
      const success = await updateResource(studentId, { 
        ageClass: newAgeClass, 
        curriculumProfile 
      });
      if (success) {
        toast.success(`Student categorized to ${newAgeClass}${curriculumProfile ? ` (${curriculumProfile})` : ''}`);
        // Refresh data to ensure UI is in sync
        fetchStudents(1, searchTerm, 200);
      } else {
        toast.error('Failed to update categorization');
      }
    } catch (error) {
      toast.error('An error occurred while updating');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = students.filter(student => 
    student.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getKUColor = (ku?: string) => {
    switch (ku) {
      case 'KU-10': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'KU-12': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'KU-14': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'KU-17': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Students</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage student age categories (KU) to align with training curriculum.
          </p>
        </div>
        
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Class Info</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Age Class (KU)</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold dark:bg-blue-900/40">
                        {student.user?.fullName?.[0] || 'U'}
                      </div>
                      <div>
                        <span className="block font-medium text-slate-900 dark:text-white">
                          {student.user?.fullName || 'Unknown'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {student.position || 'No Position'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 dark:text-slate-300 block">{student.user?.phoneNumber || '-'}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{student.user?.email || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 dark:text-slate-300 block">
                      H: {student.height}cm · W: {student.weight}kg
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      DOB: {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        disabled={updatingId === student.id}
                        value={student.ageClass || ''}
                        onChange={(e) => handleAgeClassChange(student.id, e.target.value)}
                        className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-colors ${getKUColor(student.ageClass)}`}
                      >
                        <option value="" className="text-slate-900 bg-white">Unassigned</option>
                        <option value="KU-10" className="text-slate-900 bg-white text-base">KU-10 (Fundamental)</option>
                        <option value="KU-12" className="text-slate-900 bg-white text-base">KU-12 (Fundamental Full)</option>
                        <option value="KU-14" className="text-slate-900 bg-white text-base">KU-14 (Intermediate)</option>
                        <option value="KU-17" className="text-slate-900 bg-white text-base">KU-17 (Advanced)</option>
                      </select>
                      {updatingId === student.id && (
                        <div className="size-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {student.user?.status === 'Active' ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="size-4 text-amber-500" />
                      )}
                      <span className={`text-xs font-medium ${student.user?.status === 'Active' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {student.user?.status || 'Unknown'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {loading ? 'Loading students...' : 'No students found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <div className="flex gap-3">
          <Info className="size-5 text-blue-600 shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold">Categorization Guide</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Assign <strong>KU-10</strong> for kids aged 7-10 years (Fundamentals).</li>
              <li>Assign <strong>KU-12</strong> for kids aged 11-12 years (Fundamental Full).</li>
              <li>Assign <strong>KU-14</strong> for teens aged 13-14 years (Intermediate).</li>
              <li>Assign <strong>KU-17</strong> for teens aged 15-17 years (Advanced).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
