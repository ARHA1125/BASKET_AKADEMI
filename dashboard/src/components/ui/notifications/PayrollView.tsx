import { Badge, Card, Text, Title, formatIDR } from './Common';

const MOCK_COACHES = [
  { id: 'C-01', name: 'Coach Shin', role: 'Head Coach', sessions: 24, rate: 150000, bonus: 500000, total: 4100000, status: 'paid' },
  { id: 'C-02', name: 'Coach Indra', role: 'Assistant', sessions: 18, rate: 120000, bonus: 0, total: 2160000, status: 'processing' },
  { id: 'C-03', name: 'Coach Bima', role: 'Physical', sessions: 12, rate: 120000, bonus: 0, total: 1440000, status: 'pending' },
];

export default function PayrollView() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
          <div>
            <Title>Coach Payroll</Title>
            <Text>Automated salary calculation based on attendance.</Text>
          </div>
          <div className="text-right">
             <p className="text-sm text-slate-500">Total Payroll (Oct)</p>
             <p className="text-2xl font-bold text-slate-900">{formatIDR(7700000)}</p>
          </div>
       </div>
  
       <Card noPadding>
          <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                      <th className="px-6 py-3">Coach Name</th>
                      <th className="px-6 py-3 text-center">Total Sessions</th>
                      <th className="px-6 py-3 text-right">Rate / Session</th>
                      <th className="px-6 py-3 text-right">Base Salary</th>
                      <th className="px-6 py-3 text-right">Performance Bonus</th>
                      <th className="px-6 py-3 text-right">Take Home Pay</th>
                      <th className="px-6 py-3 text-center">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {MOCK_COACHES.map((coach) => (
                      <tr key={coach.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700">
                                      {coach.name.split(' ')[1].substring(0,2).toUpperCase()}
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{coach.name}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">{coach.role}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                 {coach.sessions}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-slate-500 dark:text-slate-400">{formatIDR(coach.rate)}</td>
                          <td className="px-6 py-4 text-right text-sm text-slate-500 dark:text-slate-400 font-mono">{formatIDR(coach.sessions * coach.rate)}</td>
                          <td className="px-6 py-4 text-right text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                              {coach.bonus > 0 ? `+ ${formatIDR(coach.bonus)}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 dark:text-slate-50">{formatIDR(coach.total)}</td>
                          <td className="px-6 py-4 text-center">
                              <Badge status={coach.status} />
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-right">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors">
                 Process Batch Payment
              </button>
          </div>
       </Card>
    </div>
  );
}
