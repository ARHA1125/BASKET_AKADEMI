"use client";

import { Badge } from "@/components/Badge";
import { Card } from "@/components/ui/Card";
import { PlayerCard } from "@/components/ui/admin/PlayerCard";
import {
    Activity,
    Bell,
    BookOpen,
    Calendar,
    FileText,
    Star,
    Trophy,
    Zap
} from 'lucide-react';

const STUDENT_ASSIGNMENTS = [
  { id: 1, title: 'Shooting Mechanics Analysis', type: 'Video Task', due: 'Tomorrow, 23:59', status: 'Pending', course: 'Offensive Fundamentals' },
  { id: 2, title: 'Physical Conditioning Log', type: 'Form Input', due: 'Fri, 27 Oct', status: 'Submitted', course: 'Physical Education' },
];

const TargetIcon = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Student Portal</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, Raka. You have 2 pending assignments.</p>
            </div>
            <div className="flex gap-3">
                <button className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-500 hover:text-blue-600 shadow-sm relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Stats & Profile */}
            <div className="space-y-6">
                {/* The Player Card - Integrated formally */}
                <Card className="p-6 border-t-4 border-t-blue-500">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-gray-50">Current Rating</h3>
                        {/* @ts-ignore */}
                        <Badge color="gold">Season 2024</Badge>
                    </div>
                    <PlayerCard 
                        name="Raka Aditama"
                        position="PG"
                        ovr="88"
                        stats={{ spd: 92, sho: 84, pas: 90, dri: 88, def: 65, phy: 74 }}
                        theme="light"
                    />
                        <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                            <span className="text-gray-500 dark:text-gray-400">Category</span>
                            <span className="font-medium text-gray-900 dark:text-gray-50">U-16 Elite</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                            <span className="text-gray-500 dark:text-gray-400">Height / Weight</span>
                            <span className="font-medium text-gray-900 dark:text-gray-50">178cm / 68kg</span>
                        </div>
                            <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Coach</span>
                            <span className="font-medium text-gray-900 dark:text-gray-50">Coach Budi</span>
                        </div>
                    </div>
                </Card>

                {/* Academic Summary */}
                <Card className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4">Training Progress</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">XP Progress (Lvl 14)</span>
                                <span className="font-bold text-blue-600">82%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Attendance Rate</span>
                                <span className="font-bold text-blue-600">92%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Center/Right Column: LMS Content */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Active Assignments */}
                <Card>
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-600" /> Active Assignments
                        </h3>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3">Task Name</th>
                                    <th className="px-5 py-3">Course</th>
                                    <th className="px-5 py-3">Due Date</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {STUDENT_ASSIGNMENTS.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">
                                            <div className="flex items-center gap-2">
                                                {task.type === 'Video Task' ? <div className="bg-red-100 dark:bg-red-900/20 p-1 rounded text-red-600 dark:text-red-400"><Zap size={12}/></div> : <div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded text-blue-600 dark:text-blue-400"><FileText size={12}/></div>}
                                                {task.title}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{task.course}</td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{task.due}</td>
                                        <td className="px-5 py-3">
                                            {/* @ts-ignore */}
                                            <Badge variant={task.status === 'Submitted' ? 'success' : 'warning'}>{task.status}</Badge>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Weekly Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-50">Next Session</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Today, 16:00 PM</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-gray-50 text-sm">Drill: Defense Mastery</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Court A • Coach Budi</p>
                                    </div>
                                    {/* @ts-ignore */}
                                    <Badge variant="blue">Upcoming</Badge>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Check In</button>
                        </div>
                    </Card>

                    <Card className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Star size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-50">Achievements</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Recent badges unlocked</p>
                            </div>
                        </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col items-center justify-center p-2 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 w-1/3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-1"><Trophy size={14}/></div>
                                    <span className="text-[10px] font-bold text-center text-gray-700 dark:text-gray-300">MVP</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 w-1/3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1"><Activity size={14}/></div>
                                    <span className="text-[10px] font-bold text-center text-gray-700 dark:text-gray-300">Iron Man</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 w-1/3 opacity-50">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center mb-1"><TargetIcon size={14}/></div>
                                    <span className="text-[10px] font-bold text-center text-gray-700 dark:text-gray-300">Locked</span>
                                </div>
                            </div>
                            <button className="w-full mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">View All Badges</button>
                    </Card>
                </div>

            </div>
        </div>
    </div>
  )
}
