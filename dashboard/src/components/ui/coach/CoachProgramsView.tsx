'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common';
import { Users, Calendar, BookOpen, Loader2, Plus, Edit2, Trash2, ChevronRight, CheckCircle2, X, UserPlus, UserMinus } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { TrainingClass } from '@/types/training';
import { Level } from '@/types/curriculum';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SchedulePicker } from './SchedulePicker';

interface Student {
  id: string;
  user: {
    id: string;
    fullName: string;
  };
  ageClass?: string;
  trainingClass?: {
    id: string;
    name: string;
  };
}

export function CoachProgramsView() {
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false);
  const [isSchedulePickerOpen, setIsSchedulePickerOpen] = useState(false);
  const [isEditSchedulePickerOpen, setIsEditSchedulePickerOpen] = useState(false);
  const [deleteDialogClass, setDeleteDialogClass] = useState<TrainingClass | null>(null);
  const [editingClass, setEditingClass] = useState<TrainingClass | null>(null);
  const [managingClass, setManagingClass] = useState<TrainingClass | null>(null);
  
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [curriculumLevels, setCurriculumLevels] = useState<Level[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [newClass, setNewClass] = useState({ name: '', schedule: '', ageClass: '', curriculumLevelId: '' });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchCurriculumLevels();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load training classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        const students = result.data || result;
        setAllStudents(Array.isArray(students) ? students : []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchCurriculumLevels = async () => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/curriculum-levels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurriculumLevels(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch curriculum levels:', error);
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClass),
      });
      if (response.ok) {
        toast.success('Training class created');
        setIsCreateDialogOpen(false);
        setNewClass({ name: '', schedule: '', ageClass: '', curriculumLevelId: '' });
        fetchClasses();
      } else {
        toast.error('Failed to create class');
      }
    } catch (error) {
      toast.error('Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const updateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    setSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/classes/${editingClass.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingClass.name,
          schedule: editingClass.schedule,
          ageClass: editingClass.ageClass,
          curriculumLevelId: editingClass.curriculumLevel?.id,
        }),
      });
      if (response.ok) {
        toast.success('Training class updated');
        setIsEditDialogOpen(false);
        setEditingClass(null);
        fetchClasses();
      } else {
        toast.error('Failed to update class');
      }
    } catch (error) {
      toast.error('Failed to update class');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteClass = async () => {
    if (!deleteDialogClass) return;
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/classes/${deleteDialogClass.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success('Training class deleted');
        setDeleteDialogClass(null);
        fetchClasses();
      } else {
        toast.error('Failed to delete class');
      }
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const assignStudent = async (studentId: string, classId: string) => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trainingClassId: classId }),
      });
      if (response.ok) {
        toast.success('Student assigned');
        fetchClasses();
        fetchStudents();
      } else {
        toast.error('Failed to assign student');
      }
    } catch (error) {
      toast.error('Failed to assign student');
    }
  };

  const bulkAssignFromClass = async (sourceClassId: string, targetClassId: string) => {
    const sourceClass = classes.find(c => c.id === sourceClassId);
    if (!sourceClass || !sourceClass.students || sourceClass.students.length === 0) {
      toast.error('No students in selected class');
      return;
    }

    try {
      const token = Cookies.get('auth_token');
      let successCount = 0;
      
      for (const student of sourceClass.students) {
        const response = await fetch(`${apiUrl}/academic/students/${student.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trainingClassId: targetClassId }),
        });
        if (response.ok) successCount++;
      }

      toast.success(`Assigned ${successCount} students from ${sourceClass.name}`);
      fetchClasses();
      fetchStudents();
    } catch (error) {
      toast.error('Failed to bulk assign students');
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trainingClassId: null }),
      });
      if (response.ok) {
        toast.success('Student removed');
        fetchClasses();
        fetchStudents();
      } else {
        toast.error('Failed to remove student');
      }
    } catch (error) {
      toast.error('Failed to remove student');
    }
  };

  const advanceMonth = async (classId: string, currentMonthNumber: number, months: any[]) => {
    const nextMonth = months.find(m => m.monthNumber === currentMonthNumber + 1);
    if (!nextMonth) {
      toast.error('Already at the last month');
      return;
    }

    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/classes/${classId}/active-month`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activeMonthId: nextMonth.id }),
      });

      if (response.ok) {
        toast.success(`Advanced to Month ${nextMonth.monthNumber}`);
        fetchClasses();
      } else {
        toast.error('Failed to advance month');
      }
    } catch (error) {
      toast.error('Failed to advance month');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title>Training Programs</Title>
          <Text className="mt-1">Manage training classes, assign students, and track curriculum progress</Text>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <Text>No training classes yet</Text>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4 text-blue-600 hover:underline text-sm font-medium"
          >
            Create your first class
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls) => {
            const totalMonths = cls.curriculumLevel?.months?.length || 6;
            const currentMonth = cls.activeMonth?.monthNumber || 1;
            const progress = (currentMonth / totalMonths) * 100;

            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {cls.name}
                      </h3>
                      {cls.schedule && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {cls.schedule}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {cls.students?.length || 0} students
                      </span>
                      <button
                        onClick={() => {
                          setEditingClass(cls);
                          setIsEditDialogOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                        title="Edit class"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteDialogClass(cls)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                        title="Delete class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {cls.curriculumLevel && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {cls.curriculumLevel.name}
                          </span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Month {currentMonth} of {totalMonths}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {cls.activeMonth && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Current: {cls.activeMonth.title}
                          </p>
                          {currentMonth < totalMonths && (
                            <button
                              onClick={() => advanceMonth(cls.id, currentMonth, cls.curriculumLevel?.months || [])}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            >
                              <ChevronRight className="w-3 h-3" />
                              Advance to Month {currentMonth + 1}
                            </button>
                          )}
                          {currentMonth === totalMonths && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setManagingClass(cls);
                        setIsManageStudentsOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Manage Students
                    </button>
                    <a
                      href="/coach/curriculum"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      View Curriculum
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Title>Create Training Class</Title>
              <button onClick={() => setIsCreateDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Name</label>
                <input
                  required
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. U-12 Rookie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Schedule</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClass.schedule}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Click calendar to select..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsSchedulePickerOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age Class (KU)</label>
                <select
                  value={newClass.ageClass || ''}
                  onChange={(e) => setNewClass({ ...newClass, ageClass: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select age class...</option>
                  <option value="KU-10">KU-10</option>
                  <option value="KU-12">KU-12</option>
                  <option value="KU-14">KU-14</option>
                  <option value="KU-17">KU-17</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Curriculum Level</label>
                <select
                  required
                  value={newClass.curriculumLevelId}
                  onChange={(e) => setNewClass({ ...newClass, curriculumLevelId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level...</option>
                  {curriculumLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center min-w-[100px]"
                >
                  {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditDialogOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Title>Edit Training Class</Title>
              <button onClick={() => setIsEditDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={updateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Name</label>
                <input
                  required
                  type="text"
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Schedule</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingClass.schedule || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Click calendar to select..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditSchedulePickerOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age Class (KU)</label>
                <select
                  value={editingClass.ageClass || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, ageClass: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select age class...</option>
                  <option value="KU-10">KU-10</option>
                  <option value="KU-12">KU-12</option>
                  <option value="KU-14">KU-14</option>
                  <option value="KU-17">KU-17</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Curriculum Level</label>
                <select
                  required
                  value={editingClass.curriculumLevel?.id || ''}
                  onChange={(e) => {
                    const level = curriculumLevels.find(l => l.id === e.target.value);
                    setEditingClass({ ...editingClass, curriculumLevel: level });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level...</option>
                  {curriculumLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center min-w-[100px]"
                >
                  {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isManageStudentsOpen && managingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Title>Manage Students - {managingClass.name}</Title>
              <button onClick={() => setIsManageStudentsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">{managingClass.students?.length || 0}</span> students currently enrolled
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Class to Move Students From</h4>
                
                <div className="space-y-3">
                  {classes
                    .filter((c) => c.id !== managingClass.id)
                    .map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {cls.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {cls.students?.length || 0} students • {cls.schedule || 'No schedule'}
                          </p>
                        </div>
                        <button
                          onClick={() => bulkAssignFromClass(cls.id, managingClass.id)}
                          disabled={!cls.students || cls.students.length === 0}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserPlus className="w-4 h-4" />
                          Move All Students
                        </button>
                      </div>
                    ))}
                  
                  {classes.filter((c) => c.id !== managingClass.id).length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                      No other classes available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteDialogClass)}
        title="Delete Training Class"
        description={`Are you sure you want to delete "${deleteDialogClass?.name}"? Students will be unassigned from this class. This action cannot be undone.`}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogClass(null);
        }}
        onConfirm={deleteClass}
        loading={loading}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <SchedulePicker
        isOpen={isSchedulePickerOpen}
        onClose={() => setIsSchedulePickerOpen(false)}
        onSave={(schedule) => setNewClass({ ...newClass, schedule })}
        initialSchedule={newClass.schedule}
      />

      <SchedulePicker
        isOpen={isEditSchedulePickerOpen}
        onClose={() => setIsEditSchedulePickerOpen(false)}
        onSave={(schedule) => setEditingClass(editingClass ? { ...editingClass, schedule } : null)}
        initialSchedule={editingClass?.schedule}
      />
    </div>
  );
}
