'use client';

import { useState, useEffect } from 'react';
import { Title } from '@/components/ui/notifications/Common';

interface SchedulePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: string) => void;
  initialSchedule?: string;
}

export function SchedulePicker({ isOpen, onClose, onSave, initialSchedule }: SchedulePickerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<string>('16:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (initialSchedule) {
      const timeMatch = initialSchedule.match(/\d{2}:\d{2}/);
      if (timeMatch) {
        setSelectedTime(timeMatch[0]);
      }
    }
  }, [initialSchedule]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      return;
    }
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const scheduleDays = selectedDays.map(day => {
      const date = new Date(currentYear, currentMonth, day);
      return dayNames[date.getDay()];
    });
    
    const schedule = `${scheduleDays.join(', ')} ${selectedTime}`;
    onSave(schedule);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in zoom-in-95 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <Title>Select Training Schedule</Title>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {monthName}
          </span>

          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="rounded border-none bg-slate-100 p-1 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select training days (you can select multiple days)
          </p>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span
                key={d}
                className="text-[10px] font-bold uppercase text-slate-400"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday = day === today.getDate();
              const isSelected = selectedDays.includes(day);

              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`flex aspect-square items-center justify-center rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : isToday
                        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="block h-2 w-2 rounded-full bg-blue-600"></span>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="block h-2 w-2 rounded-full border border-blue-500 bg-blue-100 dark:bg-blue-900/50"></span>
              <span>Today</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={selectedDays.length === 0}
            className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
