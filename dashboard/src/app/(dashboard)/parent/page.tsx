"use client";

import { Badge } from "@/components/Badge";
import { Card } from "@/components/ui/Card";
import { PlayerCard } from "@/components/ui/admin/PlayerCard";
import {
   CreditCard,
   Download,
   FileText,
   MessageCircle
} from 'lucide-react';

const PARENT_BILLS = [
  { id: 1, title: 'SPP November 2024', amount: 'Rp 750.000', due: '5 Hari lagi', status: 'Unpaid', date: '01 Nov 2024' },
  { id: 2, title: 'Turnamen Fee U-16', amount: 'Rp 150.000', due: 'Lunas', status: 'Paid', date: '28 Oct 2024' },
];

export default function ParentDashboardPage() {
  return (
    <div className="space-y-6">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Dashboard Overview</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your children&apos;s progress and academy payments.</p>
            </div>
            <div className="flex items-center gap-3">
                {/* Child Selector */}
                <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
                    <button className="px-3 py-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md shadow-sm">Raka Aditama</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Dimas Anggara</button>
                </div>
            </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Child Profile Card */}
            <div className="space-y-6">
                <Card className="p-6 border-t-4 border-t-blue-500">
                    <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 text-center">Student Profile</h3>
                    <PlayerCard 
                        name="Raka Aditama"
                        position="PG"
                        ovr="88"
                        stats={{ spd: 92, sho: 84, pas: 90, dri: 88, def: 65, phy: 74 }}
                        theme="light"
                    />
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-50">92%</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Assignments</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-50">14/15</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-2">
                            <MessageCircle size={16}/> Chat with Coach
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-2">
                            <FileText size={16}/> Request Leave
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-2">
                            <Download size={16}/> Download Report Card
                        </button>
                    </div>
                </Card>
            </div>

            {/* Right: Financials & Schedule */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Financial Status Table */}
                <Card>
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                            <CreditCard size={18} className="text-blue-600"/> Financial Status
                        </h3>
                        {/* @ts-ignore */}
                        <Badge variant="destructive">1 Unpaid Invoice</Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3">Description</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {PARENT_BILLS.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">{bill.title}</td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{bill.date}</td>
                                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">{bill.amount}</td>
                                        <td className="px-5 py-3">
                                            {/* @ts-ignore */}
                                            <Badge variant={bill.status === 'Paid' ? 'success' : 'destructive'}>{bill.status}</Badge>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {bill.status === 'Unpaid' ? (
                                                <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 font-bold">Pay Now</button>
                                            ) : (
                                                <button className="text-gray-400 dark:text-gray-500 text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-900">Receipt</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Attendance / Schedule Summary */}
                <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-gray-50">Upcoming Schedule</h3>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View Calendar</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
                                <span className="text-[10px] font-bold uppercase">Oct</span>
                                <span className="text-lg font-bold leading-none">28</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-gray-50 text-sm">Kejurda U-16 Selection</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gor Soemantri • 08:00 - 12:00</p>
                            </div>
                            <div className="ml-auto">
                                    {/* @ts-ignore */}
                                    <Badge variant="orange">Important</Badge>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                                <span className="text-[10px] font-bold uppercase">Oct</span>
                                <span className="text-lg font-bold leading-none">29</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-gray-50 text-sm">Regular Training</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Home Court • 16:00 - 18:00</p>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    </div>
  )
}
