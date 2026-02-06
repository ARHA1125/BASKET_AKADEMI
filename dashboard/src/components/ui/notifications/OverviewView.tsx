import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight
} from 'lucide-react';
import { Card, Metric, Text, Title, formatIDR } from './Common';

const CASH_FLOW_DATA = [
  { month: 'Mei', income: 45000000, expense: 32000000 },
  { month: 'Jun', income: 48000000, expense: 35000000 },
  { month: 'Jul', income: 52000000, expense: 38000000 },
  { month: 'Ags', income: 49000000, expense: 42000000 },
  { month: 'Sep', income: 58000000, expense: 40000000 },
  { month: 'Okt', income: 62500000, expense: 38000000 },
];

export default function OverviewView() {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card decoration="indigo" decorationColor="indigo">
          <Text>Total Revenue (October)</Text>
          <div className="flex items-end gap-3 mt-2">
             <Metric>{formatIDR(62500000)}</Metric>
             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 mb-1 border border-emerald-100">
               <ArrowUpRight size={12}/> +12.5%
             </span>
          </div>
          <Text className="mt-2 text-xs">Target: {formatIDR(70000000)}</Text>
        </Card>

        <Card decoration="rose" decorationColor="rose">
          <div className="flex items-start justify-between">
             <Text>Aging AR (Outstanding)</Text>
             <AlertCircle size={16} className="text-rose-500 opacity-60"/>
          </div>
          <div className="flex items-end gap-3 mt-2">
             <Metric>{formatIDR(3750000)}</Metric>
             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 mb-1 border border-rose-100">
               15 Students
             </span>
          </div>
          <Text className="mt-2 text-xs">Overdue &gt; 30 days: {formatIDR(1500000)}</Text>
        </Card>

        <Card decoration="emerald" decorationColor="emerald">
          <Text>Net Profit Estimate</Text>
          <div className="flex items-end gap-3 mt-2">
             <Metric>{formatIDR(24500000)}</Metric>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '39%' }}></div>
          </div>
          <div className="flex justify-between mt-2">
             <Text className="text-xs">Gross Margin</Text>
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">39%</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
              <div>
                <Title>Cash Flow Trends</Title>
                <Text>Income vs Expense per month</Text>
              </div>
              <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-indigo-100 dark:bg-indigo-900"></span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Expense</span>
                  </div>
              </div>
          </div>
          

          <div className="h-72 flex items-end justify-between gap-2 sm:gap-4 mt-4">
            {CASH_FLOW_DATA.map((item, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-2 group relative">

                 <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-xs p-2 rounded pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    <p>In: {formatIDR(item.income)}</p>
                    <p className="opacity-80">Out: {formatIDR(item.expense)}</p>
                 </div>
                 
                 <div className="w-full h-64 flex gap-1 items-end justify-center">
                    <div style={{ height: `${(item.income / 70000000) * 100}%` }} className="w-full max-w-[24px] bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-600"></div>
                    <div style={{ height: `${(item.expense / 70000000) * 100}%` }} className="w-full max-w-[24px] bg-indigo-100 dark:bg-indigo-900 rounded-t-sm transition-all duration-300 hover:bg-indigo-200 dark:hover:bg-indigo-800"></div>
                 </div>
                 <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>


        <Card>
          <Title className="mb-4">Recent Transactions</Title>
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {i % 2 === 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                   </div>
                   <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{i % 2 === 0 ? 'Server Cost' : 'SPP Payment'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">04 Oct, 10:30 AM</p>
                   </div>
                </div>
                <span className={`text-sm font-medium ${i % 2 === 0 ? 'text-slate-900 dark:text-slate-50' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {i % 2 === 0 ? '-' : '+'}{formatIDR(i * 150000)}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
            View All Transactions
          </button>
        </Card>
      </div>
    </div>
  );
}
