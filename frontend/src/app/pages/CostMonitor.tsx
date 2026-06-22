import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings2, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '../components/ui/utils';

const costData = [
  { date: 'Jun 7', cost: 12.5 },
  { date: 'Jun 8', cost: 15.2 },
  { date: 'Jun 9', cost: 18.0 },
  { date: 'Jun 10', cost: 14.5 },
  { date: 'Jun 11', cost: 22.1 },
  { date: 'Jun 12', cost: 35.8 },
  { date: 'Jun 13', cost: 42.5 },
];

export function CostMonitor() {
  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cost Monitor</h1>
        <Button variant="secondary" className="gap-2"><Settings2 className="w-4 h-4" /> Budget Settings</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 flex flex-col gap-2 relative overflow-hidden">
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-[var(--dca-bg-tertiary)] opacity-20" />
          <span className="text-sm text-[var(--dca-text-secondary)]">Today's Cost</span>
          <span className="text-3xl font-semibold">$42.50</span>
          <span className="text-xs text-[var(--dca-warning)] flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18% vs yesterday
          </span>
        </Card>

        <Card className="p-6 flex flex-col gap-2">
          <span className="text-sm text-[var(--dca-text-secondary)]">This Month</span>
          <span className="text-3xl font-semibold">$345.12</span>
          <span className="text-xs text-[var(--dca-text-tertiary)] mt-1">Projected: $850.00</span>
        </Card>

        <Card className="p-6 md:col-span-2 flex items-center justify-between bg-[var(--dca-bg-tertiary)]/20 border-[var(--dca-warning)]/30">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[var(--dca-text-secondary)] flex items-center gap-2">
              Daily Budget Remaining
              <AlertCircle className="w-4 h-4 text-[var(--dca-warning)]" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[var(--dca-warning)]">$7.50</span>
              <span className="text-sm text-[var(--dca-text-tertiary)]">of $50.00</span>
            </div>
          </div>
          <div className="shrink-0 w-24 h-24 relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="45%" className="stroke-[var(--dca-bg-tertiary)] fill-none stroke-[8px]" />
              <circle cx="50%" cy="50%" r="45%" className="stroke-[var(--dca-warning)] fill-none stroke-[8px]" strokeDasharray="283" strokeDashoffset="42" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[var(--dca-warning)]">15%</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Cost Chart */}
        <Card className="lg:col-span-2 flex flex-col min-h-[300px]">
          <CardHeader className="border-b border-[var(--dca-bg-tertiary)] flex flex-row items-center justify-between pb-4">
            <CardTitle>Cost Over Time</CardTitle>
            <div className="flex bg-[var(--dca-bg-tertiary)] p-1 rounded-lg">
              <button className="px-3 py-1 text-xs rounded bg-[var(--dca-bg-secondary)] shadow">Daily</button>
              <button className="px-3 py-1 text-xs rounded text-[var(--dca-text-secondary)]">Weekly</button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dca-bg-tertiary)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--dca-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--dca-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--dca-bg-secondary)', border: '1px solid var(--dca-bg-tertiary)' }}
                  itemStyle={{ color: 'var(--dca-text-primary)' }}
                />
                <Line type="monotone" dataKey="cost" stroke="var(--dca-accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--dca-bg-primary)' }} activeDot={{ r: 6, fill: 'var(--dca-accent-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Goal Breakdown */}
        <Card className="flex flex-col min-h-[300px]">
          <CardHeader className="border-b border-[var(--dca-bg-tertiary)] pb-4">
            <CardTitle>Cost by Goal</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            <div className="flex flex-col divide-y divide-[var(--dca-bg-tertiary)]">
              <GoalCostRow name="Optimize Cloud Spend" cost="$142.10" pct={41} />
              <GoalCostRow name="Update Marketing Site" cost="$85.50" pct={25} />
              <GoalCostRow name="Weekly Summary Gen" cost="$45.00" pct={13} />
              <GoalCostRow name="Background Perception" cost="$72.52" pct={21} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Table */}
      <Card className="shrink-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--dca-bg-tertiary)] bg-[var(--dca-bg-tertiary)]/20">
          <h3 className="font-medium">Recent Reasoning Operations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--dca-text-secondary)] uppercase bg-[var(--dca-bg-secondary)] border-b border-[var(--dca-bg-tertiary)]">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Complexity</th>
                <th className="px-6 py-3 font-medium">Model</th>
                <th className="px-6 py-3 font-medium text-right">Tokens</th>
                <th className="px-6 py-3 font-medium text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dca-bg-tertiary)]">
              <OpRow time="14:32:05" task="Extract AWS Region Usage" complex="Complex" model="GPT-4o" tokens="4,520" cost="$0.12" />
              <OpRow time="14:30:10" task="Format Summary Report" complex="Moderate" model="Claude 3.5 Sonnet" tokens="1,200" cost="$0.04" />
              <OpRow time="14:28:55" task="Classify incoming log" complex="Simple" model="Ollama Llama3" tokens="150" cost="$0.00" />
              <OpRow time="14:25:01" task="Determine goal dependency" complex="Moderate" model="Claude 3.5 Sonnet" tokens="850" cost="$0.03" />
              <OpRow time="14:10:00" task="Vision analysis: Architecture Diagram" complex="Vision" model="GPT-4o" tokens="2,100" cost="$0.18" />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function GoalCostRow({ name, cost, pct }: any) {
  return (
    <div className="p-4 hover:bg-[var(--dca-bg-tertiary)]/20 transition-colors flex items-center justify-between cursor-pointer">
      <div className="flex flex-col gap-1 w-2/3">
        <span className="text-sm font-medium truncate text-[var(--dca-text-primary)] hover:text-[var(--dca-accent-primary)] hover:underline">{name}</span>
        <div className="w-full h-1.5 bg-[var(--dca-bg-tertiary)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--dca-accent-secondary)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="font-mono font-medium">{cost}</span>
    </div>
  );
}

function OpRow({ time, task, complex, model, tokens, cost }: any) {
  const getComplexBadge = (c: string) => {
    switch (c) {
      case 'Complex': return <Badge variant="low-confidence" className="bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-400">Complex</Badge>;
      case 'Vision': return <Badge variant="active" className="bg-blue-500/20 text-blue-400">Vision</Badge>;
      case 'Moderate': return <Badge variant="default" className="bg-orange-500/20 text-orange-400">Moderate</Badge>;
      default: return <Badge variant="default" className="bg-gray-500/20 text-gray-300">Simple</Badge>;
    }
  }

  return (
    <tr className="hover:bg-[var(--dca-bg-tertiary)]/30 transition-colors">
      <td className="px-6 py-3 text-[var(--dca-text-tertiary)]">{time}</td>
      <td className="px-6 py-3 font-medium text-[var(--dca-text-primary)]">{task}</td>
      <td className="px-6 py-3">{getComplexBadge(complex)}</td>
      <td className="px-6 py-3"><Badge variant="default">{model}</Badge></td>
      <td className="px-6 py-3 text-right font-mono text-[var(--dca-text-secondary)]">{tokens}</td>
      <td className="px-6 py-3 text-right font-mono font-medium">{cost}</td>
    </tr>
  );
}
