'use client';

import { useCommunity, useStudents } from '@/hooks/use-academic';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type AgeClass = 'KU-10' | 'KU-12' | 'KU-14' | 'KU-17';
const ageClassOptions: AgeClass[] = ['KU-10', 'KU-12', 'KU-14', 'KU-17'];

export function CoachSelectionView() {
  const { allData: students, fetchData: fetchStudents } = useStudents();
  const { loading, createEvent, fetchEvents, createSquad, fetchSquads, finalizeSquad } = useCommunity();
  const [events, setEvents] = useState<any[]>([]);
  const [squads, setSquads] = useState<any[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('TOURNAMENT');
  const [eventDate, setEventDate] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [squadName, setSquadName] = useState('Team Alpha');
  const [selectedAgeClass, setSelectedAgeClass] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents(1, '', 200);
    const run = async () => {
      setEvents(await fetchEvents());
      setSquads(await fetchSquads());
    };
    run();
  }, [fetchEvents, fetchSquads, fetchStudents]);

  const refreshData = async () => {
    setEvents(await fetchEvents());
    setSquads(await fetchSquads());
  };

  const filteredStudents = useMemo(() => {
    if (!selectedAgeClass) return [];

    return students.filter(
      (student) => student.ageClass === selectedAgeClass || student.curriculumProfile === selectedAgeClass,
    );
  }, [selectedAgeClass, students]);

  useEffect(() => {
    setSelectedStudentIds((prev) => prev.filter((id) => filteredStudents.some((student) => student.id === id)));
  }, [filteredStudents]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await createEvent({
      name: eventName,
      type: eventType,
      date: eventDate,
    });
    if (created) {
      toast.success('Event created');
      setEventName('');
      setEventDate('');
      await refreshData();
    } else {
      toast.error('Failed to create event');
    }
  };

  const handleCreateSquad = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await createSquad({
      name: squadName,
      eventId: selectedEventId,
      playerIds: selectedStudentIds,
      coachName: 'coach-dashboard',
    });
    if (created) {
      toast.success('Squad created and lineup points awarded');
      setSelectedStudentIds([]);
      await refreshData();
    } else {
      toast.error('Failed to create squad');
    }
  };

  const handleFinalize = async (squadId: string) => {
    const result = await finalizeSquad({ squadId, isFinalized: true, awardedBy: 'coach-dashboard' });
    if (result) {
      toast.success('Squad finalized and event participation points awarded');
      await refreshData();
    } else {
      toast.error('Failed to finalize squad');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Player Selection</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create event squads from real workflows and award lineup/event gamification automatically.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Event</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateEvent}>
              <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <option value="TOURNAMENT">Tournament</option>
                <option value="SPARRING">Sparring</option>
                <option value="TRYOUT">Tryout</option>
              </select>
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Create Event</button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Build Squad</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateSquad}>
              <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required>
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
              <input value={squadName} onChange={(e) => setSquadName(e.target.value)} placeholder="Squad name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />

              <select value={selectedAgeClass} onChange={(e) => setSelectedAgeClass(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required>
                <option value="">Select class</option>
                {ageClassOptions.map((ageClass) => (
                  <option key={ageClass} value={ageClass}>{ageClass}</option>
                ))}
              </select>

              <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                {!selectedAgeClass && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Select class first to show available students.</p>
                )}
                {selectedAgeClass && filteredStudents.map((student) => (
                  <label key={student.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{student.user.fullName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{student.ageClass || '-'} · {student.curriculumProfile || '-'}</div>
                    </div>
                  </label>
                ))}
                {selectedAgeClass && filteredStudents.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">No students found in {selectedAgeClass}.</p>
                )}
              </div>

              <button type="submit" disabled={loading || !selectedStudentIds.length} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Create Squad & Award Lineup Points</button>
            </form>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Current Squads</h2>
          <div className="mt-4 space-y-4">
            {squads.map((squad) => (
              <div key={squad.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{squad.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{squad.event?.name || '-'} · {squad.players?.length || 0} players</div>
                  </div>
                  <button onClick={() => handleFinalize(squad.id)} disabled={loading || squad.isFinalized} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    {squad.isFinalized ? 'Finalized' : 'Finalize Squad'}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(squad.players || []).map((player: any) => (
                    <span key={player.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{player.user?.fullName || 'Player'}</span>
                  ))}
                </div>
              </div>
            ))}
            {squads.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No squads have been created yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
