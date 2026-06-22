import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Activity, Target, Brain, Database, AlertTriangle, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const dummyTrend = Array.from({ length: 20 }, () => ({ value: Math.random() * 100 }));

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Primary Goal Hero */}
      <Card variant="glass" className="relative overflow-hidden border-[var(--dca-accent-primary)]/30">
        <div className="absolute inset-0 bg-[var(--dca-accent-primary)]/5 opacity-50" />
        <CardContent className="p-8 flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--dca-text-tertiary)] uppercase tracking-wider">Primary Active Goal</span>
              <Badge variant="active">Running</Badge>
            </div>
            <h1 className="text-3xl font-semibold text-[var(--dca-text-primary)]">Optimize Cloud Infrastructure Spend</h1>
            <p className="text-[var(--dca-text-secondary)]">Analyzing historical usage patterns and deploying reserved instances across 3 AWS regions.</p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-32 h-32 rounded-full border-[8px] border-[var(--dca-bg-tertiary)] relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-[var(--dca-success)] fill-none stroke-[8px]"
                strokeDasharray="283"
                strokeDashoffset="70" /* 75% complete */
              />
            </svg>
            <span className="text-2xl font-bold">75%</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard title="Active Goals" value="12" icon={Target} trend={dummyTrend} color="var(--dca-accent-primary)" />
        <SummaryCard title="Online Agents" value="8 / 10" icon={Brain} subtext="Avg Trust: 0.92" color="var(--dca-success)" />
        <SummaryCard title="Cognitive Spend" value="$42.50" icon={Activity} subtext="12% of daily budget" color="var(--dca-warning)" />
        <SummaryCard title="World State Facts" value="1,430" icon={Database} alert={true} color="var(--dca-info)" />
        <SummaryCard title="System Health" value="100%" icon={Cpu} subtext="All services operational" color="var(--dca-success)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Live Event Stream */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-4 border-b border-[var(--dca-bg-tertiary)] flex flex-row items-center justify-between">
            <CardTitle>Live Event Stream</CardTitle>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-[var(--dca-bg-tertiary)]">All</Badge>
              <Badge variant="default" className="opacity-50">Perception</Badge>
              <Badge variant="default" className="opacity-50">Cognition</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="flex flex-col">
              {[
                { time: '14:32:05', type: 'cognition', icon: Brain, color: 'var(--dca-success)', text: 'Task completed: AWS Cost Analysis' },
                { time: '14:31:42', type: 'perception', icon: Eye, color: 'var(--dca-info)', text: 'New document ingested: Q3 Architecture diagram' },
                { time: '14:30:10', type: 'governance', icon: ShieldAlert, color: 'var(--dca-accent-secondary)', text: 'Agent assigned: OptimizerBot assigned to Goal #402' },
                { time: '14:28:55', type: 'error', icon: AlertTriangle, color: 'var(--dca-warning)', text: 'Conflict detected on Entity: US-East-1 Region Status' },
                { time: '14:25:01', type: 'cognition', icon: Brain, color: 'var(--dca-success)', text: 'Routing decision: Complex query routed to GPT-4o' },
              ].map((evt, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border-b border-[var(--dca-bg-tertiary)] hover:bg-[var(--dca-bg-tertiary)]/30 transition-colors">
                  <span className="text-xs text-[var(--dca-text-tertiary)] whitespace-nowrap mt-1">{evt.time}</span>
                  <div className="mt-1" style={{ color: evt.color }}>
                    <evt.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-[var(--dca-text-primary)]">{evt.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ServiceStatus name="NATS JetStream" latency="12ms" status="ok" />
            <ServiceStatus name="PostgreSQL" latency="45ms" status="ok" />
            <ServiceStatus name="Redis Cache" latency="2ms" status="ok" />
            <ServiceStatus name="Ollama (Local)" latency="120ms" status="ok" />
            <ServiceStatus name="OpenAI Gateway" latency="400ms" status="ok" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, trend, subtext, color, alert }: any) {
  return (
    <Card variant="glass" className="hover:border-[var(--dca-accent-primary)]/50 transition-colors cursor-pointer">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--dca-text-secondary)]">{title}</span>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-[var(--dca-text-primary)]">{value}</span>
          {trend && (
            <div className="h-8 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {(subtext || alert) && (
          <div className="flex items-center justify-between text-xs mt-1">
            {subtext && <span className="text-[var(--dca-text-tertiary)]">{subtext}</span>}
            {alert && <Badge variant="blocked" className="text-[10px] px-1.5">1 Conflict</Badge>}
          </div>
        )}
        <div className="text-[10px] text-[var(--dca-text-tertiary)] mt-2">Updated just now</div>
      </CardContent>
    </Card>
  );
}

function ServiceStatus({ name, latency, status }: any) {
  const isOk = status === 'ok';
  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-[var(--dca-bg-tertiary)]/50">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-[var(--dca-success)]' : 'bg-[var(--dca-error)]'}`} />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span className="text-xs text-[var(--dca-text-tertiary)]">{latency}</span>
    </div>
  );
}
