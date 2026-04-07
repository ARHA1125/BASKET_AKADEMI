import React from 'react';
import { Card, Title, Text, Metric } from '@/components/ui/notifications/Common';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

const ProgressBar = ({ value, color = 'bg-blue-500' }: { value: number; color?: string }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
    <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
  </div>
);

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    gray: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

const ProgressRow = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className="text-slate-500 dark:text-slate-400">{value}%</span>
    </div>
    <ProgressBar value={value} color={value > 80 ? 'bg-emerald-500' : value > 60 ? 'bg-blue-500' : 'bg-amber-500'} />
  </div>
);

const LogItem = ({ coach, class: className, status, isAlert }: { coach: string; class: string; status: string; isAlert?: boolean }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
    <div className="flex items-center">
      {isAlert ? <AlertCircle className="text-red-500 mr-3" size={18} /> : <CheckCircle2 className="text-emerald-500 mr-3" size={18} />}
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{coach}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{className}</p>
      </div>
    </div>
    <Badge color={isAlert ? 'red' : 'green'}>{status}</Badge>
  </div>
);

export default function CurriculumOverviewView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Text>Total Siswa Aktif</Text>
          <Metric>342</Metric>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-600 font-medium flex items-center"><TrendingUp size={16} className="mr-1"/> +12%</span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">dari semester lalu</span>
          </div>
        </Card>
        <Card>
          <Text>Tingkat Kelulusan Materi (Bulan Ini)</Text>
          <Metric>78%</Metric>
          <ProgressBar value={78} color="bg-blue-500" />
        </Card>
        <Card>
          <Text>Kepatuhan Evaluasi Pelatih</Text>
          <Metric>92%</Metric>
          <ProgressBar value={92} color="bg-emerald-500" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Title className="mb-2">Progres Penguasaan Materi (Fundamental)</Title>
          <Text className="mb-6">Persentase siswa yang menguasai modul di Semester 1.</Text>
          <div className="space-y-4">
            <ProgressRow label="Dasar Body Control & Footwork" value={95} />
            <ProgressRow label="Moving Without the Ball (Cuts)" value={88} />
            <ProgressRow label="Ballhandling & Dribbling" value={65} />
            <ProgressRow label="Shooting (BEEF, Layup)" value={72} />
          </div>
        </Card>
        
        <Card>
          <Title className="mb-2">Log Evaluasi Pelatih</Title>
          <Text className="mb-4">Status pengisian metrik bulanan</Text>
          <div className="space-y-4">
            <LogItem coach="Coach Budi" class="Fundamental A" status="Selesai" />
            <LogItem coach="Coach Anton" class="Intermediate B" status="Selesai" />
            <LogItem coach="Coach Sarah" class="Advanced" status="Tertunda" isAlert />
          </div>
        </Card>
      </div>
    </div>
  );
}
