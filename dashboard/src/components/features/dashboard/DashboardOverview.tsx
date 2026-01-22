"use client";

import { Badge } from "@/components/Badge";
import { Card } from "@/components/ui/Card";
import { PlayerCard } from "@/components/ui/admin/PlayerCard";
import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  LucideIcon,
  MoreVertical,
  Search,
  Shirt,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap
} from 'lucide-react';
import { useState } from 'react';



interface Metric {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color: string;
}

const METRICS: Metric[] = [
  { title: 'Total Revenue (Bulanan)', value: 'Rp 145.2 Jt', change: '+12.5%', trend: 'up', icon: Wallet, color: 'emerald' },
  { title: 'Siswa Aktif', value: '342', change: '+8 Siswa', trend: 'up', icon: Users, color: 'blue' },
  { title: 'Rata-rata Kehadiran', value: '88.4%', change: '-2.1%', trend: 'down', icon: Activity, color: 'blue' },
  { title: 'Stok Menipis', value: '4 SKU', change: 'Segera Restock', trend: 'neutral', icon: ShoppingBag, color: 'red' },
];

const AT_RISK_STUDENTS = [
  { id: 1, name: 'Dimas Anggara', class: 'U-16 Red', risk: 'High', reason: 'Absen 3 sesi berturut-turut', probability: '85%' },
  { id: 2, name: 'Kevin Sanjaya', class: 'U-14 White', risk: 'Medium', reason: 'SPP Overdue 7 hari', probability: '60%' },
];

const UPCOMING_TASKS = [
  { id: 1, type: 'Finance', title: 'Verifikasi 5 Pembayaran Manual', time: '10 min ago', urgent: true },
  { id: 2, type: 'Inventory', title: 'Restock Jersey Size M (Sisa 2)', time: '1 hour ago', urgent: true },
  { id: 3, type: 'Academic', title: 'Approve Rencana Latihan Coach Budi', time: '3 hours ago', urgent: false },
];

export function DashboardOverview() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              Dashboard Overview 
              <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">v2.1 Live</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selamat pagi, berikut adalah ringkasan operasional akademi hari ini.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari siswa, invoice, event..." 
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button className="relative p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none transition-all">
              <Zap size={16} />
              Quick Action
            </button>
          </div>
        </header>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {METRICS.map((metric, index) => (
            <Card key={index} className="p-5 flex items-start justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{metric.value}</h3>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  metric.trend === 'up' ? 'text-emerald-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' && <TrendingUp size={12} />}
                  {metric.trend === 'down' && <TrendingDown size={12} />}
                  {metric.trend === 'neutral' && <AlertTriangle size={12} />}
                  {metric.change}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-${metric.color}-600 ring-1 ring-gray-100 dark:ring-gray-700`}>
                <metric.icon size={24} className={`text-${metric.color}-500`} />
              </div>
            </Card>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-blue-600" />
                  Action Required
                </h3>
                {/* @ts-ignore - Variant 'blue' added dynamically */}
                <Badge variant="blue">{UPCOMING_TASKS.length} Pending</Badge>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {UPCOMING_TASKS.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{task.type}</span>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <span className="text-xs text-gray-400">{task.time}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-900/50 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      Process
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 text-center border-t border-gray-100 dark:border-gray-800">
                <button className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center gap-1 w-full">
                  Lihat Semua Tugas <ChevronRight size={12} />
                </button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="p-5 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                    <BrainCircuit size={18} className="text-purple-600" />
                    AI Retention Insight
                  </h3>
                  {/* @ts-ignore */}
                  <Badge variant="error">Critical</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sistem AI mendeteksi <span className="font-bold text-gray-900 dark:text-gray-50">{AT_RISK_STUDENTS.length} siswa</span> berisiko tinggi berhenti latihan berdasarkan pola kehadiran dan pembayaran.
                </p>
                <div className="space-y-3">
                  {AT_RISK_STUDENTS.map((student) => (
                    <div key={student.id} className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-50">{student.name}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{student.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-gray-500">Churn Prob.</span>
                        <span className="text-sm font-bold text-red-700 dark:text-red-400">{student.probability}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                  Lihat Detail Analisis
                </button>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative border-0">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Trophy size={120} />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-1 text-blue-400">Player of the Month</h3>
                  <p className="text-xs text-slate-300 mb-4">Performa terbaik berdasarkan kenaikan XP</p>
                  
                  <div className="flex items-center justify-center">
                    <div className="transform scale-90">
                      <PlayerCard 
                        name="Raka Aditama"
                        position="PG"
                        ovr="88"
                        stats={{
                          spd: 92, sho: 84, pas: 90,
                          dri: 88, def: 65, phy: 74
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                     <p className="text-sm font-medium">Class: U-18 Elite</p>
                     <p className="text-xs text-blue-400 font-bold">+240 XP Week ini</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-gray-50">Transaksi Terakhir</h3>
                <button className="text-sm text-blue-600 font-medium hover:underline">Lihat Laporan</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-5 py-3">Invoice ID</th>
                      <th className="px-5 py-3">Siswa/Item</th>
                      <th className="px-5 py-3">Tanggal</th>
                      <th className="px-5 py-3">Jumlah</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">INV-2024-001</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">SPP Oktober - Budi S.</td>
                      <td className="px-5 py-3 text-gray-500">24 Okt, 10:30</td>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">Rp 750.000</td>
                      <td className="px-5 py-3">
                        {/* @ts-ignore */}
                        <Badge variant="success">Paid</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">INV-2024-002</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">Jersey Kit Home (L)</td>
                      <td className="px-5 py-3 text-gray-500">24 Okt, 09:15</td>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">Rp 350.000</td>
                      <td className="px-5 py-3">
                         {/* @ts-ignore */}
                        <Badge variant="warning">Pending</Badge>
                      </td>
                    </tr>
                     <tr>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">INV-2024-003</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">Turnamen Fee U-16</td>
                      <td className="px-5 py-3 text-gray-500">23 Okt, 16:45</td>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-50">Rp 150.000</td>
                      <td className="px-5 py-3">
                        {/* @ts-ignore */}
                        <Badge variant="success">Paid</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

          <div className="space-y-8">
            
            <Card className="p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                Upcoming Events
              </h3>
              
              <div className="space-y-4">
                <div className="relative pl-4 border-l-2 border-blue-200 dark:border-blue-900">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white dark:border-gray-900"></div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">Sabtu, 28 Okt</p>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">Kejurda U-16 Selection</h4>
                  <p className="text-xs text-gray-500 mt-1">Gor Soemantri • 08:00 AM</p>
                  <div className="mt-2 flex gap-2">
                    {/* @ts-ignore */}
                    <Badge variant="blue">Drafting Open</Badge>
                    <span className="text-xs text-gray-400 flex items-center">12/15 Roster</span>
                  </div>
                </div>

                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full border border-white dark:border-gray-900"></div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Minggu, 29 Okt</p>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">Friendly Match vs Spartans</h4>
                  <p className="text-xs text-gray-500 mt-1">Home Court • 14:00 PM</p>
                </div>
              </div>
              
              <button className="w-full mt-5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800">
                Buka Kalender Full
              </button>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-gray-700 dark:text-gray-400" />
                  Smart Inventory
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                  <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm text-red-500">
                    <Shirt size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-50 truncate">Jersey Home (M)</p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">Sisa 2 Pcs • Habis dlm 3 hari</p>
                  </div>
                  <button className="p-1.5 bg-white dark:bg-gray-900 text-gray-500 rounded border border-gray-200 dark:border-gray-800 hover:text-blue-500">
                    <MoreVertical size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-colors">
                  <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm text-gray-500">
                    <Zap size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-50 truncate">Sleeve Pad (Black)</p>
                    <p className="text-xs text-gray-500">Sisa 15 Pcs • Aman</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-xs font-medium text-blue-600 hover:text-blue-700 text-center">
                Ke Manajemen Stok →
              </button>
            </Card>

            <Card className="p-5 bg-slate-900 text-white border-0">
              <h3 className="font-bold text-sm mb-4 text-slate-300">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    WhatsApp Gateway
                  </span>
                  <span className="text-emerald-400 font-mono">Connected</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Midtrans Payment
                  </span>
                  <span className="text-emerald-400 font-mono">Active</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Face ID AI Node
                  </span>
                  <span className="text-blue-400 font-mono">Ready</span>
                </div>
              </div>
            </Card>

          </div>
        </div>
    </div>
  );
}
